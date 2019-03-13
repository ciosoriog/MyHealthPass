'use strict'
const expect = require('chai').expect
const auth = require('../lib/myhealthpass-auth')

describe('Token and crypto utilities', () => {
    it('tokens should be an object', () => {
        expect(auth.cryptography).to.be.a('object')
    })
    describe('Asymetric encryption', () => {
        it('hash should be a function', () => {
            expect(auth.cryptography.hash).to.be.a('function')
        })

        it('"test1234" should hash as "YzQ5NGQ1OWVlODgzZDU0NDdiY2JhM2QwNDdiYzRhMzQ3Y2FkNTllOTA5YTU2ZTFlNWQ1ZDg5M2M5YzI1ZGQ1Mw=="', () => {
            var token = auth.cryptography.hash('test1234')
            
            expect(token).to.be.equal('YzQ5NGQ1OWVlODgzZDU0NDdiY2JhM2QwNDdiYzRhMzQ3Y2FkNTllOTA5YTU2ZTFlNWQ1ZDg5M2M5YzI1ZGQ1Mw==')

        })
    })
    describe('Symetric', () => {
        it('Encryption should be a function', () => {
            expect(auth.cryptography.encryptSymetric64).to.be.a('function')
        })

        it('Decryption should be a function', () => {
            expect(auth.cryptography.decryptSymetric64).to.be.a('function')
        })

        it('"test1234" should be encrypted and decrypted back', () => {
            var crypto = auth.cryptography.encryptSymetric64('test1234')
            expect(crypto).to.be.ok

            var decrypto = auth.cryptography.decryptSymetric64(crypto)
            expect(decrypto).to.be.equal('test1234')
        })

    })
})