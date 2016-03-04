import Sequelize from 'sequelize'
import {db} from '../utils/db'
import Component from './component'
import Transition from './transition'

const Node = db.define('Node', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  }
})

Node.hasMany(Component, {as: 'components'})
Node.hasMany(Transition, {as: 'transitions'})

export default Node
