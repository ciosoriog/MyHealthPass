'use strict'

const auth = require('../lib/myhealthpass-auth')


// Sets up the standalone options for unit testing

function setupInitTest() {    
    var opts = {
        database: {
            host : '127.0.0.1',
            user : 'root',
            password : '',
            database : 'myhealthpass'
        },
        password: {
            minlength: 4,
            containsdigit: true,
            containsupper: true,
            containslower: true,
            containsnonalphanumeric: true
        },
        cryptography: {
            asymetrickey: 'asymetric-key',
            symetrickey: 'symetric-key'
        },
        session: {
            expirationseconds: 60 * 10, // 10 minutes
            lockoutattempts: 3,
            bruteforcing: {
                minutestocheck: 10,
                minutestolock: 20,
                countrequests: 13
            }
        }
    }

    auth.factory(opts)
}

console.log("--------- TEST RAN " + new Date().toISOString() + " ---------")
setupInitTest()

module.exports = setupInitTest;