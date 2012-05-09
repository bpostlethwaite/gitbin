/* 
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */
"use strict";

var app = require('./dot').dotjs;
var errf = require('./errf').errf;
var e = errf(); //to use colored output

// MAIN APP START
app.start( function (err, istate) {
    // CALLBACK I
    var args = process.argv.splice(2),
        command = args.shift();
    if (err) throw err;
    else {
        var commands = require('./commands')
            .commands(args, istate);
        parseSwitch(commands, command, function (err, state) {
            // CALLBACK II
            if (err) {
                if ( err.usage ){
                    console.log(e.red + err.message + e.reset);
                    app.usage();
                }
                else {
                    console.log(e.red + 'Encountered Error: ' + e.reset);
                    console.log('    ' + err.message );
                }
            }
            else {
                if (state) {
                    app.writestate( state );
                }
                else { // WILL THIS EVER BE THE CASE, PERHAPS WHILE DEBUGGING
                    console.log('We have no error and no state, bugs!');
                }
            }
        }); // end CALLBACK II
    } 
}); // end CALLBACK I

// MAIN COMMAND SWITCHBOARD
var parseSwitch = function (commands, command, cb) {
    switch (command) {
    case 'init':
        commands.init(cb);
        break;
    case 'add':
        commands.add(cb);
        break;
    case 'remove':
        commands.remove(cb);
        break;
    case 'bin':
        commands.bin(cb);
        break;
    default:
        cb( errf( ((command === undefined) ? '' : 'Unknown command: ' + command), true) );
    }
};