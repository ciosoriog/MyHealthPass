'use strict'

/*const knexFactory = require('knex')
const auth = require('../myhealthpass-auth');

const knex = knexFactory({
    client: 'mysql',
    connection: auth.options.database
})

module.exports = knex*/


const knexFactory = require('knex')

function factory(authOpts) {
    if(!authOpts) 
        throw new Error("AuthOpts cannot be undefined on db factory")
        
    module.exports.instance = knexFactory({
        client: 'mysql',
        connection: authOpts.database
    })
}

module.exports = factory