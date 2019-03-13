'use strict'
//const auth = require('../myhealthpass-auth').opts


const regexDigit = /\d+/
const regexUpper = /[A-Z]+/
const regexLower = /[a-z]+/
const regexNonAlpha = /[^A-z\d]+/

function enforcePassword(str, opts) {
    if(!opts)
        throw new Error("Options have not been set, cannot determine the validity of the password")
    
    if(str && str.length > 0) {
        if(opts.password.minlength > 0 && str.length < opts.password.minlength)
        return false;
        if(opts.password.containsdigit && !str.match(regexDigit))
            return false;
        if(opts.password.containsupper && !str.match(regexUpper))
            return false;
        if(opts.password.containslower && !str.match(regexLower))
            return false;
        if(opts.password.containsnonalphanumeric && !str.match(regexNonAlpha))
            return false;
        
        return true;
    }
    return false;
}

module.exports = enforcePassword