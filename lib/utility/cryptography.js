'use strict'

const sha256 = require('js-sha256').sha256
const simplecrypto = require('simple-crypto-js').default
const base64 = require('base-64')


module.exports = {
    asymetrickey: simplecrypto.generateRandom(),
    symetrickey: simplecrypto.generateRandom(),
    simpleCryptoInstance: null,

    factory: function(authOpts) {
        
        if(!authOpts)
            throw new Error("authOpts must be setted")
        if(authOpts.cryptography && authOpts.cryptography.asymetrickey)
            this.asymetrickey = authOpts.cryptography.asymetrickey;
    
        if(authOpts.cryptography && authOpts.cryptography.symetrickey)
            this.symetrickey = authOpts.cryptography.symetrickey;
    
        this.simpleCryptoInstance = new simplecrypto(this.symetrickey);
    },

    encryptSymetric64: function(str) {
        let cypher = this.simpleCryptoInstance.encrypt(str)
        return base64.encode(cypher)
    },
    decryptSymetric64: function(str) {
        let decoded = base64.decode(str)
        return this.simpleCryptoInstance.decrypt(decoded)
    },
    hash: function(str) {
        let h = sha256.hmac(this.asymetrickey, str)
        return base64.encode(h)
    }
}