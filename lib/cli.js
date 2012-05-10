/* 
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */
"use strict";
var app = require('./dot').app(__dirname + '/../.state.json')
, commands = require('./commands').commands()
, e = require('./errf').errf() //to use colored output
, args = process.argv.splice(2)
, command = args.shift();

//
// ## Main app start ##
//
app.start( function (err, istate) {
    if (err) throw err;
    else {

        
        commands.switchboard(command, args, istate, cmdCallback); 
    } 
}); 

//
// ## Callback for command ##
//
var cmdCallback = function (err, state) {
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
            app.writestate( state, function (err) { 
                if (err) {
                    console.log(err);
                }
                else {
                    console.log('wrote state');
                }
            });
        }
        else { // WILL THIS EVER BE THE CASE? PERHAPS WHILE DEBUGGING
            console.log('We have no error and no state, bugs!');
        }
    }
}; 

