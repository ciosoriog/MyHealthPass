'use strict'

module.exports = {
    CREDENTIALS_REGEX: /^ *(?:[Mm][Hh][Pp]) +([A-Za-z0-9._~+/-]+=*) *$/,
    SESSION_REGEX: /^([^@]*)@([^@]*)@(.*)$/,
    cryptography: null,

    factory: function(cryptography) {
        this.cryptography = cryptography
    },

    build: function(credentials) {
        if (!credentials) {
            return undefined
        }

        let session = credentials.user_id + '@' + credentials.session_id + '@' + credentials.expire_date
        let encrypted = this.cryptography.encryptSymetric64(session)

        return "mhp " + encrypted
    },

    extract: function(str) {
        var match = this.CREDENTIALS_REGEX.exec(str)

        if (!match) {
            return undefined
        }

        let encrypted = match[1]
        let decrypted = this.cryptography.decryptSymetric64(encrypted)


        let credentialMatches = this.SESSION_REGEX.exec(decrypted)

        // return credentials object
        return new Credentials(credentialMatches[1], credentialMatches[2], credentialMatches[3])
    }
}

class Credentials {
    constructor(user_id, session_id, expire_date) {
        this.user_id = user_id
        this.session_id = session_id
        if(typeof expire_date == 'string')
            this.expire_date = Date.parse(expire_date)
        else if(typeof expire_date == 'Date') 
            this.expire_date = expire_date
        else 
            throw new Error('Expiration date is in the wrong format: ' + expire_date)
    }
}
  