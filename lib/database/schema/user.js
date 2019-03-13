'use strict'

const db = require('../database').instance
const tablename = 'users'

function up () {
    return db.schema.hasTable(tablename).then((hasTable) => {
        if(!hasTable)
        {
            return db.schema.createTable(tablename, (table) => {
                table.increments('id')
                table.string('email')
                table.string('name')
                table.string('passwordHash')
                table.boolean('lockedout').defaultTo(false)
                table.integer('loginerrorcount').defaultTo(0)
            })
        }
        return hasTable;

    })
}

module.exports = {
    tablename,
    up
}