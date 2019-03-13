'use strict'

const db = require('../database').instance
const tablename = 'connections'

function up () {
    return db.schema.hasTable(tablename).then((hasTable) => {
        if(!hasTable)
        {
            return db.schema.createTable(tablename, (table) => {
                table.bigincrements('id')
                table.string('ip').notNullable()
                table.string('useragent').notNullable()
                table.string('requestsignature').notNullable()
                table.dateTime('requestdate').notNullable(),
                table.boolean('locksconnection').defaultTo(false)
            })
        }
        return hasTable;

    })
}

module.exports = {
    tablename,
    up
}