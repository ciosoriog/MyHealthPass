'use strict'

const expect = require('chai').expect;
const db = require('../lib/database/database').instance
const Users = require('../lib/database/schema/user')
const Sessions = require('../lib/database/schema/session')
const Connections = require('../lib/database/schema/connections')

function databaseSchemaCheck(dbObject) {
    it('should contain a string that indicates tablename', () => {
        expect(dbObject.tablename).to.be.a('string')
    })

    describe('"up"', () => {
        it('should be a function', () => {
            expect(dbObject.up).to.be.a('function')
        })
        

        it('should create a table named '.concat(dbObject.tablename), () => {
            return dbObject.up()
                .then(() => db.schema.hasTable(dbObject.tablename))
                .then((hasTable) => expect(hasTable).to.be.true)
        })
    })
}

describe('Database checks', () => {
        
    describe('User database schema', () => {
        databaseSchemaCheck(Users)
    })
    describe('Session database schema', () => {
        databaseSchemaCheck(Sessions)
    })
    describe('Connections database schema', () => {
        databaseSchemaCheck(Connections)
    })
})
