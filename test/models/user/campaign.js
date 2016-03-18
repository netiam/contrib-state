import Sequelize from 'sequelize'
import Campaign from '../campaign'
import Node from '../node'
import User from '../user'
import {db} from '../../utils/db'

const UserCampaign = db.define('UserCampaign', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
  },
  score: {
    type: Sequelize.INTEGER
  },
  baseId: {
    type: Sequelize.UUID,
    allowNull: false,
    unique: 'unique_user_campaign'
  },
  ownerId: {
    type: Sequelize.UUID,
    allowNull: false,
    unique: 'unique_user_campaign'
  }
})

UserCampaign.belongsTo(Campaign, {as: 'base'})
UserCampaign.belongsTo(User, {as: 'owner'})
UserCampaign.belongsTo(Node, {as: 'current'})

export default UserCampaign
