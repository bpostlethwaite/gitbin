//
// ## Test Dependencies ##
//

var statefile = __dirname + '/.teststateA.json'
, commands = require('../lib/commands').commands();

var fs = require('fs');

//
// Dummy Data
//
var dummyState = [
    {
        "bin": "test/testbin_a",
        "active": true,
        "binfiles": {}
    },
    {
        "bin": "test/testbin_b",
        "active": false,
        "binfiles": {}
    }
];

var State;

//
// Need to change directories to
// simulate realuse scenarios.
// Dot.js is not run from it's own
// main directory.
//


//
// ## Tests
//

describe('COMMAND LOGIC:', function () {
    
    
    it('must print usage on no command', function (done) {
        commands.go('','', dummyState, function (err, state) {
            if (err.usage && !state) {
                done()
            } // could use should.throw('message')
        });
    });
    
    it('must print usage on bad command', function (done) {
        commands.go('yar!','rm *', dummyState, function (err, state) {
            if (err.usage && !state) {
                done()
            }
        });
    });
    
    
    it('must add file and change state', function (done) {
        commands.go('add',['test/foo.dum'], dummyState, function (err, state) {
            if (err) throw err;
            else {
                state[0].binfiles.should.have.property(process.cwd()+'/test/foo.dum');
                fs.readdir('test/testbin_a', function (err, list) {
                    if (err) return done(err);
                    list.should.include('foo.dum');
                });
                done()
            }
        });
    });

//
// After (Cleanup) -> Remove files from testbin_a
//
    after( function (done) {
        fs.readdir('test/testbin_a', function (err, list) {
            if (err) return done(err);
            list.forEach( function (file) {
                if (file === "foo.dum") {
                    fs.unlinkSync('test/testbin_a/foo.dum'); 
                }
                else if (file === "bar.dum") {
                    fs.unlinkSync('test/testbin_a/bar.dum');
                }
            });
            done();
        });
    });
            
}); // end describe COMMAND LOGIC