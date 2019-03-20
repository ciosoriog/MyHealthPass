'use strict'

const uuid = require('uuid/v1')

module.exports = {
    options: null,
    enforcer: null,
    database: null,
    cryptography: null,
    credentials: null,

    factory: function(options, enforcer,database, cryptography, credentials) {
        this.options = options
        this.enforcer = enforcer
        this.database = database
        this.cryptography = cryptography
        this.credentials = credentials
    },

    register: async function(newUser) {
        if(!newUser) 
            return new registerResponse(false, 'New user was not specified')
        if(!this.enforcer.email(newUser.email))
            return new registerResponse(false, 'Enforcing policy failed for email')
        if(!this.enforcer.password(newUser.password))
            return new registerResponse(false, 'Enforcing policy failed for password')

        var count = await this.database('users').count('id as cnt').where('email', newUser.email)

        if(count[0].cnt > 0)
            return new registerResponse(false, 'User exists')
        else {
            var password = newUser.password;
            delete newUser.password

            newUser.passwordHash = this.cryptography.hash(password)
            newUser.lockedout = false

            try {
                var res = await this.database('users').insert(newUser).returning('*')
                return new registerResponse(true, null)
                
            } catch (err) {
                return new registerResponse(false, 'Unhandled error: '.concat(err.message))
            }
        }
    },

    getuser: async function(email) {
        var users = await this.database('users').where('email', email)
        if(users.length > 0)
            return users[0]
        return null
    },

    login: async function(email, password, ip) {
        try {
            let users = await this.database('users').where('email', email)
            
            if(users.length === 0) {
                return new loginResponse(false, 'user not found or password incorrect')

            }

            let user = users[0]
            if(user.lockedout) {
                return new loginResponse(false, 'account is locked out', null, 0)
            }
            
            let passwordHash = this.cryptography.hash(password)
            if(user.passwordHash === passwordHash)
            {
                var session = {
                    sessionidentifier: uuid(),
                    sessionstarted: new Date(),
                    ipaddress: ip,
                    user_id: user.id
                }

                await this.database('users').where('id', user.id).update({ loginerrorcount: 0 })

                let sesionId = await this.database('sessions').insert(session).returning('*')
                let expiration = new Date()
                expiration.setSeconds(expiration.getSeconds() + this.options.session.expirationseconds)
                
                var creds = Credentials.fromDatabase(session, expiration)
                let token = this.credentials.build(creds)


                return new loginResponse(true, null, token)
            }
            else {
                let errorCount = user.loginerrorcount + 1;
                let lockedout = this.options.session.lockoutattempts <= errorCount
                
                await this.database('users').where('id', user.id).update({ loginerrorcount: errorCount, lockedout: lockedout })
                return new loginResponse(false, 'user not found or password incorrect', null, this.options.session.lockoutattempts - errorCount)
            }
        }
        catch (err){
            return new loginResponse(false, "Unhandled Error: " + err.message)
        }
        
    },
    
    sessionValid: async function(token, ip) {
        var tokensession = this.credentials.extract(token)
        var session = await this.database('sessions').where({sessionidentifier: tokensession.session_id, ipaddress: ip})
        if(session.length > 0) {
            if(new Date() < tokensession.expire_date) {
                return true
            }
            else {
                await this.database('sessions').where('id', session[0].id).del()
                return false
            }
        }
        else {
            return false
        }

    },
    sessionExtend: async function(token, ip) {
        let isValid = await this.sessionValid(token, ip)
        if(isValid) {
            var tokensession = this.credentials.extract(token)
            tokensession.expire_date = new Date()
            tokensession.expire_date.setSeconds(tokensession.expire_date.getSeconds() + this.options.session.expirationseconds)

            let newtoken = this.credentials.build(tokensession)
            return newtoken
        }
        return null;
    },
    registerConnection: async function(ip, useragent, requestsignature) {
        let requestdate = new Date()
        let querydate = new Date().setMinutes(-(this.options.session.bruteforcing.minutestocheck))
        let lockdate = new Date().setMinutes(-(this.options.session.bruteforcing.minutestolock))

        let lockconns = await this.database('connections')
            .where('requestdate', '>', lockdate)
            .andWhere('locksconnection', true)
            .andWhere('ip', ip)
            .andWhere('useragent', useragent)
            .andWhere('requestsignature', requestsignature)
            .orderBy('requestdate', 'desc')

        if(lockconns.length > 0) 
        {
            // account is locked
            return false;
        }

        let conns = await this.database('connections')
            .where('requestdate', '>', querydate)
            .orderBy('requestdate', 'desc')

        let connection = {
            ip: ip,
            useragent: useragent,
            requestsignature: requestsignature,
            requestdate: new Date()
        }


        if(conns.length >= this.options.session.bruteforcing.countrequests) {
            // Lock out the connection
            connection.locksconnection = true
            await this.database('connections').insert(connection)
            return false
        }
        else {
            await this.database('connections').insert(connection)
            return true
        }
    }
}


class loginResponse {
    constructor(success, error, token, remainingTries) {
        this.success = success
        this.error = error
        this.token = token
        this.remainingTries = remainingTries
    }
}


class registerResponse {
    constructor(success, error) {
        this.success = success
        this.error = error
    }
}

class Credentials {
    constructor(user_id, session_id, expire_date) {
        this.user_id = user_id
        this.session_id = session_id
        if(typeof expire_date == 'string')
            this.expire_date = Date.parse(expire_date)
        else if(expire_date instanceof Date) 
            this.expire_date = expire_date
        else 
            throw new Error('Expiration date is in the wrong format: ' + expire_date)
    }

    static fromDatabase(dbSession, expire_date) {
        return new Credentials(dbSession.user_id, dbSession.sessionidentifier, expire_date)
    }
}
  