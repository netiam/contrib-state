import Sequelize from 'sequelize'
import {db} from '../utils/db'

const Component = db.define('Component', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  }
})

export default Component
