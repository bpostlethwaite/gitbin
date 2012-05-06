/* 
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */

/*
 * Commands namespace
 */
"use strict";

var commands = function () {};

commands.init = function () {
    console.log( 'Going to initialize: ', process.cwd() );
    return this.state
};

commands.add = function () {
    console.log( 'Adding files to bin: ', this.args.splice(1) );
    return this.state
};

commands.bin = function () {
    var i;
    for (i in this.state) {
        console.log( this.state[i].binfiles );
    }
    return this.state
};


exports.command = commands;
