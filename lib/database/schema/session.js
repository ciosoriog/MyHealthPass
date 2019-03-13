'use strict'

const db = require('../database').instance
const user = require('./user')
const tablename = 'sessions'

function up() {
    return db.schema.hasTable(tablename).then((hasTable) => {
        if(!hasTable)
        {
            return db.schema.createTable(tablename, (table) => {
                table.bigIncrements('id')
                table.string('sessionidentifier').index()
                table.dateTime('sessionstarted')
                table.string('ipaddress')
                table.integer('user_id').unsigned().index().references('id').inTable(user.tablename)
            })
        }
        return hasTable;
        
    })
}


module.exports = {
    tablename,
    up
}