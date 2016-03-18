import util from 'util'
import {
  setup,
  teardown
} from './utils/db'
import Campaign from './models/campaign'
import Component from './models/component'
import Node from './models/node'
import Project from './models/project'
import Transition from './models/transition'
import User from './models/user'
import UserCampaign from './models/user/campaign'
import state from '../src/state'
import campaignFixture from './fixtures/campaign.json'
import campaignsFixture from './fixtures/campaigns.jsonapi.json'
import nodeFixture from './fixtures/node.json'
import userFixture from './fixtures/user.json'

const map = [
  {
    base: Campaign,
    state: UserCampaign,
    baseField: 'baseId',
    userField: 'ownerId'
  }
]

describe('netiam', () => {
  describe('REST - state', () => {

    before(setup)
    after(teardown)

    it('should create a user', done => {
      User
        .create(userFixture)
        .then(() => done())
        .catch(done)
    })

    it('should create a campaign', done => {
      Campaign
        .create(campaignFixture)
        .then(() => done())
        .catch(done)
    })

    it('should create a node', done => {
      Node
        .create(nodeFixture)
        .then(() => done())
        .catch(done)
    })

    it('should create a user-campaign', done => {
      UserCampaign
        .create({
          score: 10,
          baseId: '95601afb-8d60-482e-b98a-4ca3cada452d',
          ownerId: '50c24ff3-4553-468a-89ae-ca5302ad5413',
          currentId: 'd42e1623-89c3-4c89-ab80-8a6c6988cbad'
        })
        .then(() => done())
        .catch(err => {
          console.error(err)
          done(err)
        })
    })

    it('should fetch campaign enriched with state', done => {
      const req = {params: {user: '50c24ff3-4553-468a-89ae-ca5302ad5413'}}
      const res = {body: campaignsFixture}
      const plugin = state.res({map})
      plugin(req, res)
        .then(() => {
          res.body.should.have.property('data')
          res.body.data.should.be.Array()
          res.body.data[0].should.have.property('attributes')
          res.body.data[0].attributes.should.have.properties([
            'name',
            'createdAt',
            'updatedAt',
            'id',
            'score'
          ])
        })
        .then(() => done())
        .catch(done)
    })

  })
})
