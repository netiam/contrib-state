import _ from 'lodash'
import assert from 'assert'
import Promise from 'bluebird'
import util from 'util'

function models(map) {
  const base = {}
  const state = {}
  map.forEach(mapping => {
    base[_.kebabCase(mapping.base.name)] = {
      model: mapping.state,
      baseField: mapping.baseField,
      userField: mapping.userField
    }
    state[_.kebabCase(mapping.base.name)] = mapping.base
  })

  return Object.freeze({
    base,
    state
  })
}

function typeMap(userId, documents, table) {
  const types = {}
  if (!_.isArray(documents) && _.isObject(documents)) {
    documents = [documents]
  }

  if (!_.isArray(documents)) {
    throw new Error('Wrong type "documents".')
  }

  _.forEach(documents, document => {
    const type = _.get(table.base, document.type, false)
    if (!type) {
      return
    }

    if (!_.isObject(types[document.type])) {
      types[document.type] = {}
    }

    if (!_.has(types[document.type], document.id)) {
      if (!_.has(document, 'attributes')) {
        document.attributes = {}
      }

      types[document.type][document.id] = {
        model: table.base[document.type].model,
        original: document.attributes,
        relationships: document.relationships,
        query: {
          [table.base[document.type].baseField]: document.id,
          [table.base[document.type].userField]: userId
        }
      }
    }
  })

  return types
}

// TODO The following code duplicates adapter functionality, as soon as adapters
// are available as packages, this code should be removed
export const PATH_SEPARATOR = '.'

export function getAssociationModel(model, path) {
  const parts = path.split(PATH_SEPARATOR)
  let part
  while (part = parts.shift()) {
    const target = `associations.${part}.target`
    if (!_.has(model, target)) {
      throw new Error('Association does not exist')
    }
    model = _.get(model, target)
  }

  return model
}

export function setRelationship(model, document, path, resourceIdentifiers) {
  if (!_.isArray(resourceIdentifiers)) {
    resourceIdentifiers = [resourceIdentifiers]
  }

  const associationModel = getAssociationModel(model, path)

  const ids = _.map(resourceIdentifiers, resourceIdentifier => resourceIdentifier.id)
  const associationType = model.associations[path].associationType
  return associationModel
    .findAll({where: {id: {$in: ids}}})
    .then(relatedDocuments => {
      switch (associationType) {
        case 'HasOne':
        case 'BelongsTo':
          return document[`set${_.capitalize(path)}`](relatedDocuments.shift())
        case 'HasMany':
        case 'BelongsToMany':
          return document[`set${_.capitalize(path)}`](relatedDocuments)
        default:
          console.warn('Associations different than "HasOne", "HasMany" and "BelongsToMany" are not supported')
      }
    })
}

function req({
  userParam = 'user',
  map = []} = {}) {

  assert.ok(userParam)

  const table = models(map)

  return function(req) {
    const map = typeMap(req.params[userParam], req.body.data, table)
    const list = []
    // TODO filter state properties from req.body to avoid issues with REST plugin
    _.forEach(map, type => _.forEach(type, id => {
      const p = id.model
        .findOne({where: id.query})
        .then(document => document ? document : id.model.create(id.query))
        .then(document => {
          const attributeKeys = _.keys(id.model.attributes)
          const attributes = _.pick(id.original, attributeKeys)

          return document.update(attributes)
        })
        .then(document => {
          _.forEach(id.model.associations, (association, associationName) => {
            // TODO support *-many relationships
            const idValue = _.get(id, `relationships.${associationName}.data.id`, false)
            if (!idValue) {
              return
            }
            const type = _.kebabCase(association.target.name)
            return setRelationship(id.model, document, associationName, {
              id: idValue,
              type: type
            })
          })
        })
      list.push(p)
    }))
    return Promise.all(list)
  }

}

function res({
  userParam = 'user',
  map = []} = {}) {

  assert.ok(userParam)

  const table = models(map)

  return function(req, res) {
    const map = typeMap(req.params[userParam], res.body.data, table)
    const list = []
    _.forEach(map, type => _.forEach(type, id => {
      const p = id.model
        .findOne({where: id.query})
        .then(document => {
          if (!document) {
            return
          }
          document = document.toJSON()
          const keys = _.map(id.model.associations, association => association.foreignKey)
          const idKeys = _.keys(id.query)
          // TODO fetch state associations
          _.forEach(id.model.associations, (association, associationName) => {
            const key = association.foreignKey
            if (idKeys.indexOf(key) !== -1) {
              return
            }
            // TODO support *-many relationships
            const type = _.kebabCase(association.target.name)
            const idValue = _.get(document, key, false)
            if (!idValue) {
              return
            }
            id.relationships[associationName] = {
              data: {
                id: idValue,
                type
              }
            }
          })

          const exclude = _.without(keys, ...idKeys)
          const state = _.omit(document, exclude)
          _.merge(id.original, state)
        })
      list.push(p)
    }))
    return Promise.all(list)
  }

}

export default Object.freeze({
  req,
  res
})
