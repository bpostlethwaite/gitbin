//
// ## Test Dependencies ##
//

"use strict"

var assert = require('assert')
,   statefile = __dirname + '/.teststateA.json'
,   app = require('../lib/dot').app(statefile)
,   e = require('../lib/errf').errf();

//
// Dummy Data
//
var testname;
var dummyState = [
    {
        "bin": "./testbin_a",
        "active": true,
        "binfiles": {}
    },
    {
        "bin": "./testbin_b",
        "active": false,
        "binfiles": {}
    }
];
//
// Aliases
//
var pass = true
,   fail = false;

//
// ## Tests ##
// note: since test asyncronous order
// or return may not be order of tests
// in test file.
//

var msg = testmsg('App registers initialized file');
assert.strictEqual( app.statefile,statefile, msg(fail) ) || print( msg(pass) );


app.readstate( function (err, state) {
    
    var msg = testmsg('App reads state correctly');
    (assert.ifError(err) && print( msg(fail) )) ||
        assert.strictEqual( typeof(state), 'object', msg(fail) ) ||
        assert.strictEqual( state.length, 2, msg(fail) ) || print( msg(pass) )
});    


app.writestate(dummyState, function (err) {

    var msg = testmsg('App writes state correctly');
    (assert.ifError(err) && print( msg(fail) )) || print( msg(pass) );
});


//
// Helper functions
//

function print (msg) {
    console.log(msg)
};
//
// Returns a function which will print
// a message according to pass or fail
// arguement.
//
function testmsg (msg) {
    var that = {}
    ,   message = e.grey + '    ' + msg + ': ' + e.reset
    ,   passed = e.green + 'passed' + e.reset
    ,   failed = e.red + 'failed' + e.reset;
 
    that = function(pass) {
        if (pass) return message + passed;
        else return message + failed;
    };
    
    return that;
};