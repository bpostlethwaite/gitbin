/* 
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */
"use strict"

var app = require('./dot').dotjs
var args = process.argv.splice(2);

switch (args[0]) {
case 'init':
    app.command.init();
    break;
case 'add':
    app.command.add(args);
    break;
default:
    app.command.usage( app.usage );
}