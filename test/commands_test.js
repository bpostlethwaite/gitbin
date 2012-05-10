//
// ## Test Dependencies ##
//

var statefile = __dirname + '/.teststateA.json'
, commands = require('../lib/commands').commands();

//
// Dummy Data
//
var dummyState = [
    {
        "bin": "./testbin_a",
        "active": true,
        "binfiles": {}
    },
    {
        "bin": "./testbin_b",
        "active": true,
        "binfiles": {}
    }
];
    
//
// ## Tests
//

describe('command logic', function () {
    
    it('must print usage on no command', function (done) {
        commands.switchboard('','', dummyState, function (err, state) {
            if (err.usage && !state) {
                done()
            }
        });
    });

    it('must print usage on bad command', function (done) {
        commands.switchboard('yar!','rm *', dummyState, function (err, state) {
            if (err.usage && !state) {
                done()
            }
        });
    });
    
    //it('Add file copies file and changes state', function (done) {
    //    commands.switchboard('add',['foo.dum','bar.dum'],

}); // end describe COMMAND LOGIC