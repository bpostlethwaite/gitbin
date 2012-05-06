/* 
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */
"use strict";

var app = require('./dot').dotjs;
var command = require('./commands').command;
var args = process.argv.splice(2);

app.readstate( function (state) {
    // should check for error or state validity
    command.state = state; 
    command.args = args;
    app.writestate( parseswitch(args) );
    }
); // end readstate


var parseswitch = function (args) {
    var state;
    switch (args[0]) {
    case 'init':
        state = command.init();
        break;
    case 'add':
        state = command.add();
        break;
    case 'bin':
        state = command.bin();
        break;
    default:
        state = app.usage();
    }
    return state;
};