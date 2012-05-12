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
        
        commands.run(command, args, istate); 
    } 
}); 
