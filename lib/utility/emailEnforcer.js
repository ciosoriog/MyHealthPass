'use strict'

// RFC 5322
var regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

function enforceEmail(str) {
    if(str && str.length > 0) {
        if(!str.match(regexEmail))
            return false;
        return true;
    }
    return false;
}

module.exports = enforceEmail