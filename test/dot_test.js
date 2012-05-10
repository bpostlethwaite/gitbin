//
// ## Test Dependencies ##
//

var statefile = __dirname + '/.teststateA.json';
var app = require('../lib/dot').app(statefile);

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

describe('app logic', function () {
    it('must register initialized file', function () {
        app.statefile.should.equal(statefile);
    });

    it('must read state correctly' , function (done) {
        app.readstate( function (err, state) {
            if (err) throw err;
            else {
                state.should.be.a('object')
                state.should.have.length(2)
                done()
            }
        });
    });

    it('must write state correctly' , function (done) {
        app.writestate(dummyState, done);
    });

}); // end describe APP LOGIC