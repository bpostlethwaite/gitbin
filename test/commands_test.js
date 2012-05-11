//
// ## Test Dependencies ##
//

var statefile = __dirname + '/.teststateA.json'
, commands = require('../lib/commands').commands()
, assert = require('assert')
, fs = require('fs')
, e = require('./../lib/errf').errf();


//
// Dummy Data
//
var testbina =  __dirname +"/testbin_a"
,   testbinb = __dirname +"/testbin_b"
,   dummyState = [
    {
        "bin": testbina,
        "active": true,
        "binfiles": {}
    },
    {
        "bin": testbinb,
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
// ## Tests
//

//
// ## No command test
//
commands.run('','', dummyState, function (err, state) {
    var msg = testmsg('Prints usage on no command');
    assert.ok( (err.usage && !state) , msg(fail) ) || print( msg(pass) );
}); 

//
// ## Bad command test
//   
commands.run('yar!','rm *', dummyState, function (err, state) {
    var msg = testmsg('Prints usage on bad command');
    assert.ok( (err.usage && !state) , msg(fail) ) || print( msg(pass) );
});

//
// ## <add> command tests
//
var testfile = 'test/foo.dum'
commands.run('add',[testfile], dummyState, function (err, state) {
    
    var msg = testmsg('<add> command returns no error');
    (assert.ifError(err) && print( msg(fail) )) || print( msg(pass) );

    var msg = testmsg('<add> command adds file into state');    
    assert.ok( (state[0].binfiles[process.cwd() + '/' + testfile]), msg(fail) ) || 
        print( msg(pass) );
    
    fs.readdir(testbina, function (err, list) {
        if (err) throw new Error('Problem reading test directory') 

        var msg = testmsg('<add> command copies file successfully');    
        assert.ok( (list.indexOf('foo.dum') >= 0 ), msg(fail) ) || print( msg(pass) );
        
        cleanup(testbina, function (err) {
            if (err) throw err;
        });
    });
});


//
// Helper functions
//
function print (msg) {
    console.log(msg)
};

function testmsg (msg) {
    var that = {}
    ,   message = e.grey + '    ' + msg + ': ' + e.reset
    ,   passed = e.green + 'passed' + e.reset
    ,   failed = e.red + 'failed' + e.reset;
 
    that = function(pass) {
        if (pass) return message + passed;
        else return '\r' + message + failed;
    };
    
    return that;
};


//
// After (Cleanup) -> Remove files from testbin_a
//
'test/testbin_a'
function cleanup (dir, cb) {
    fs.readdir(dir, function (err, list) {
        if (err) return cb(err);
        list.forEach( function (file) {
            if (file === "foo.dum") {
                fs.unlinkSync('test/testbin_a/foo.dum'); 
            }
            else if (file === "bar.dum") {
                fs.unlinkSync('test/testbin_a/bar.dum');
            }
        });
        cb(null);
    });
};

