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

function typeMap(user, documents, table) {
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
        query: {
          [table.base[document.type].baseField]: document.id,
          [table.base[document.type].userField]: user.id
        }
      }
    }
  })

  return types
}

function req({
  userParam = 'user',
  map = []} = {}) {

  assert.ok(userParam)

  const table = models(map)

  return function(req, res) {
  }

}

function res({
  userParam = 'user',
  map = []} = {}) {

  assert.ok(userParam)

  const table = models(map)

  return function(req, res) {
    const map = typeMap(req.user, res.body.data, table)
    const list = []
    _.forEach(map, type => _.forEach(type, id => {
      const p = id.model
        .findOne({where: id.query})
        .then(document => {
          if (!document) {
            return
          }
          const state = _.omit(document.toJSON(), _.keys(id.query))
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
