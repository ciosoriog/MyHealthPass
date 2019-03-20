'use strict'

/*!
 * MyHealthPass Authorization
 * Author: Carlos Osorio
 */

const extend = require('extend')
const emailEnforce = require('./utility/emailEnforcer')
const passwordEnforce = require('./utility/passwordEnforcer')
const db = require('./database/database')
const cryptography = require('./utility/cryptography')
const credentials = require('./authentication/credentials')
const auth = require('./authentication/auth')


this.options = null;

function MyHealthPassAuthFactory(opts) {
    if(!opts) {
        throw new Error("No options were provided")
    }
    if(!opts.database) {
        throw new Error("No database information was provided")
    }

    // Default Properties
    this.options = extend({
        database: {
            host : '',
            user : '',
            password : '',
            database : ''
        },
        password: {
            minlength: 0,
            containsdigit: false,
            containsnonalphanumeric: false,
            containsupper: false,
            containslower: false
        },
        cryptography: {
            asymetrickey: '',
            symetrickey: ''
        },
        session: {
            expirationseconds: 0,
            lockoutattempts: 0,
            bruteforcing: {
                minutestocheck: 0,
                minutestolock: 0,
                countrequests: 1000
            }
        }
    }, opts)
    
    db(this.options)

    // Passing options to exports
    module.exports.options = this.options

    module.exports.enforcer.options = this.options

    cryptography.factory(this.options)
    module.exports.cryptography = cryptography

    credentials.factory(cryptography)
    module.exports.users.factory(this.options, module.exports.enforcer, db.instance, module.exports.cryptography, credentials)

    // module.exports.users.enforcer = module.exports.enforcer
    // module.exports.users.database = db.instance
    // module.exports.users.cryptography = module.exports.cryptography
    // module.exports.users.credentials.factory(cryptography)
}

// async function RegisterUser(newUser, enforcer, database, cryptography) {

//     if(!newUser) 
//         return new registerResponse(false, 'New user was not specified')
//     if(!enforcer.email(newUser.email))
//         return new registerResponse(false, 'Enforcing policy failed for email')
//     if(!enforcer.password(newUser.password))
//         return new registerResponse(false, 'Enforcing policy failed for password')

//     var count = await database('users').count('id as cnt').where('email', newUser.email)

//     if(count[0].cnt > 0)
//         return new registerResponse(false, 'User exists')
//     else {
//         var password = newUser.password;
//         delete newUser.password

//         newUser.passwordHash = cryptography.hash(password)

//         try {
//             var res = await database('users').insert(newUser).returning('*')
//             return new registerResponse(true, null)
            
//         } catch (err) {
//             return new registerResponse(false, 'Unhandled error: '.concat(err.message))
//         }
//     }
// }

// async function GetUser(email, database) {
//     var users = await database('users').where('email', email)
//     if(users.length > 0)
//         return users[0]
//     return null
// }



module.exports = {
    factory: MyHealthPassAuthFactory,
    enforcer: {
        email: emailEnforce,
        password: function(str) {
            return passwordEnforce(str, this.options)
        }
    },
    users: auth
}

