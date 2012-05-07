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
    // CALLBACK
    command.state = state; 
    command.args = args;
    state = parseswitch(args);
    if (state) {
        app.writestate( state );
    }
    else {
        app.usage();
    }
}); // end readstate


var parseswitch = function (args) {
    var state;
    switch (args[0]) {
    case 'init':
        state = command.init();
        break;
    case 'add':
        state = command.add();
        break;
    case 'remove':
        state = command.remove();
        break;
    case 'bin':
        state = command.bin();
        break;
    default:
        state = false;
    }
    return state;
};