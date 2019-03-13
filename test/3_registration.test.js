'use strict'

const expect = require('chai').expect
const auth = require('../lib/myhealthpass-auth')
const testInit = require('./__init.test')
const db = require('../lib/database/database').instance
const passingEmail = 'cio@domain.com'
const passingPassword = '1234Aa.'
const ip = '127.0.0.1'


describe('Account functionality', () => {
    describe('Email Enforcing', () => {
        it('should be a function within enforcer', () => {
            expect(auth.enforcer.email).to.be.a('function')
        })

        it('should deny an email if it\'s badly formed', () => {
            expect(auth.enforcer.email('a')).to.be.false
            expect(auth.enforcer.email('a@a')).to.be.false
            expect(auth.enforcer.email('a@.a')).to.be.false
            expect(auth.enforcer.email('a@a.a')).to.be.false
        }) 
        it('should accept an email if it\'s well formed', () => {
            expect(auth.enforcer.email(passingEmail)).to.be.true
        }) 
    })

    describe('Password Enforcing', () => {
        before(function() {            
            auth.options.password.minlength = 0
            auth.options.password.containsdigit = false
            auth.options.password.containsupper = false
            auth.options.password.containslower = false
            auth.options.password.containsnonalphanumeric = false;
        })
        after(function() {
            testInit()
        })

        it('should be a function within enforcer', () => {
            expect(auth.enforcer.password).to.be.a('function')
        })

        it('should accept any password if all the options are set to 0 or false', () => {
            expect(auth.enforcer.password('f')).to.be.true
        })
        
        it('should deny a password if the length is less than the enforcing length', () => {
            auth.options.password.minlength = 4
            let ep = auth.enforcer.password('foo', auth.options)
            auth.options.password.minlength = 0
            expect(ep).to.be.false
        })

        it('should deny a password if it\'s expecting a digit', () => {
            auth.options.password.containsdigit = true
            let ep = auth.enforcer.password('foo', auth.options)
            auth.options.password.containsdigit = false
            expect(ep).to.be.false
        })
        
        it('should deny a password if it\'s expecting an uppercase', () => {
            auth.options.password.containsupper = true
            let ep = auth.enforcer.password('foo', auth.options)

            auth.options.password.containsupper = false
            expect(ep).to.be.false
        })        
        
        it('should deny a password if it\'s expecting an lowercase', () => {
            auth.options.password.containslower = true
            let ep = auth.enforcer.password('FOO', auth.options)

            auth.options.password.containslower = false
            expect(ep).to.be.false
        })
        
        it('should deny a password if it\'s expecting a non alphanumeric character', () => {
            auth.options.password.containsnonalphanumeric = true
            let ep = auth.enforcer.password('foo', auth.options)

            auth.options.password.containsnonalphanumeric = false
            expect(ep).to.be.false
        })
    })

    describe('User Registration and Login', () => {
        describe('Creating new user', () => {
            describe('Registrer Function', () => {
                it('should be a function', () => {
                    expect(auth.users.register).to.be.a('function')
                })
                it('should return a Promise', () => {
                    const objUpRes = auth.users.register()
        
                    expect(objUpRes.then).to.be.a('Function')
                    expect(objUpRes.catch).to.be.a('Function')
                })
            })
            describe('Get User function', () => {
                it('should be a function', () => {
                    expect(auth.users.getuser).to.be.a('function')
                })
                it('should return a Promise', () => {
                    const objUpRes = auth.users.register()
        
                    expect(objUpRes.then).to.be.a('Function')
                    expect(objUpRes.catch).to.be.a('Function')
                })   
            })


            before(async function() { 
                testInit()
                var res = await auth.users.database('users').where('email', passingEmail).del()
            })
            after(async function() { 
                testInit()
                var res = await auth.users.database('users').where('email', passingEmail).del()
            })
            
            it('should require user definition', () => {
                return auth.users.register().then((res) => {
                    expect(res.success).to.be.false
                    expect(res.error).to.be.equal('New user was not specified')
                })
            })

            it('should fail if email enforcing fails', () => {
                return auth.users.register({
                    email: '',
                    password: passingPassword
                }).then((res) => {
                    expect(res.success).to.be.false
                    expect(res.error).to.be.equal('Enforcing policy failed for email')
                })
            })

            it('should fail if password enforcing fails', () => {
                return auth.users.register({
                    email: passingEmail,
                    password: ''
                }).then((res) => {
                    expect(res.success).to.be.false
                    expect(res.error).to.be.equal('Enforcing policy failed for password')
                })
            })

            it('should succede if user has passing email and password', () => {
                return auth.users.register({
                    email: passingEmail,
                    password: passingPassword
                }).then((res) => {
                    expect(res.success).to.be.true
                    expect(res.error).not.be.ok
                }).then(() => {
                    auth.users.getuser(passingEmail).then((user) => {
                        expect(user).ok
                    })
                })
            })

            it('should return error since the same user was created before', () => {
                return auth.users.register({
                    email: passingEmail,
                    password: passingPassword, 
                }).then((res) => {
                    expect(res.success).to.be.false
                    expect(res.error).to.be.equal('User exists')
                })
            })
        })

        describe('User Login', () => {
            before(async function() {
                await auth.users.register({
                    email: passingEmail,
                    password: passingPassword
                })
            })

            after(async function() {
                try {
                    var user = await auth.users.getuser(passingEmail)

                    await auth.users.database('sessions').where('user_id', user.id).del()
                    await auth.users.database('users').where('email', passingEmail).del()
                } catch (error) {
                    debugger
                }
            })

            it('should have login function', () => {
                expect(auth.users.login).to.be.a('function')
            })
            
            it('should deny access if bad login', () => {
                return auth.users.login(passingEmail, passingPassword + ".", ip)
                .then((res) => {
                    expect(res).to.be.ok
                    expect(res.success).to.be.false
                    expect(res.error).to.be.equal('user not found or password incorrect')
                })
            })

            var token = null;

            it('should return session key on successful login', () => {
                return auth.users.login(passingEmail, passingPassword, ip)
                .then((res) => {  
                    expect(res).to.be.ok
                    expect(res.success).to.be.true
                    expect(res.token).to.be.match(/^ *(?:[Mm][Hh][Pp]) +([A-Za-z0-9._~+/-]+=*) *$/) // token

                    token = res.token;
                })
            })
            
            it('should allow to check session validity', () => {
                return auth.users.sessionValid(token, ip)
                .then((res) => {
                    expect(res).to.be.true
                })
            })

            it('should deny the session validity if the request comes from a different ip, not allowing token hijacking', () => {
                return auth.users.sessionValid(token, '8.8.8.8')
                .then((res) => {
                    expect(res).to.be.false
                })
            })

            it('should expire sessions after time', async () => {
                let t = token
                let original = auth.users.options.session.expirationseconds
                auth.users.options.session.expirationseconds = 0 // Inmediate expiration

                let newToken = await auth.users.sessionExtend(t, ip)
            
                auth.users.options.session.expirationseconds = original // cleanup

                let isvalid = await auth.users.sessionValid(newToken, ip)

                return expect(isvalid).to.be.false
            })


            it('should lockout user after retries', async () => {
                let response = null
                for(let i = 1; i <= auth.users.options.session.lockoutattempts + 1; i++) {
                    response = await auth.users.login(passingEmail, passingPassword + '.', ip)
                }
                
                expect(response.error).to.be.equal('account is locked out')
            })
        })

    })

    describe('Brutforcing protection engine', () => {
        it('should lock out user after bruteforcing.countrequests count', async () => {
            let response = null
            for(let i = 0; i < auth.options.session.bruteforcing.countrequests + 1; i++) {
                response = await auth.users.registerConnection(ip, 'Mozilla/5.0 (Macintosh; Intel Mac OS X x.y; rv:42.0) Gecko/20100101 Firefox/42.0', '{}')
            }
            expect(response).to.be.false
            
        })
    })
})