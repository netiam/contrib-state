import Sequelize from 'sequelize'
import cls from 'continuation-local-storage'
import uuid from 'uuid'

const namespace = cls.createNamespace(uuid.v4())
Sequelize.cls = namespace

export const db = new Sequelize('netiam', 'netiam', 'netiam', {
  dialect: 'sqlite',
  storage: './test/db.sqlite',
  logging: false
})

export function setup(done) {
  db
    .sync()
    .then(() => done())
    .catch(done)
}

export function teardown(done) {
  db
    .drop()
    .then(() => done())
    .catch(done)
}
