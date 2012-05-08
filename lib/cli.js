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

// Colorized output for error logging
var red, blue, reset;
red   = '\u001b[31m';
blue  = '\u001b[34m';
reset = '\u001b[0m';

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
                    console.log(red + err.message + reset)
                    app.usage();
                }
                else {
                    console.log(red + 'Encountered Error: ' + reset);
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
    var state;
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
        cb( errf('Unknown command:'+command, true) );
    }
};