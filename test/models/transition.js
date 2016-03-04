import Sequelize from 'sequelize'
import {db} from '../utils/db'

const Transition = db.define('Transition', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false
  },
  data: {
    type: Sequelize.TEXT,
    allowNull: true
  }
})

export default Transition
