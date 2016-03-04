import Sequelize from 'sequelize'
import {db} from '../utils/db'

const Project = db.define('Project', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  name: {
    type: Sequelize.STRING,
    unique: true
  }
})

export default Project
