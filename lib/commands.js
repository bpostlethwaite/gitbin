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
"use strict"

var commands = module.exports;

commands.init = function () {
    console.log( 'Going to initialize: ', process.cwd() );
};

commands.add = function (args) {
    console.log( 'Adding files to bin: ', args.splice(1) );
};

commands.usage = function( message ) {
    helper.print( message );
};


/*
 * Helper namespace
 */
var helper = function () {};

helper.print = function ( strlist ) {
    var i
    if ( strlist.length  > 0 ) {
        for (i = 0; i < strlist.length; i += 1) {
            console.log(strlist[i]);
        }
    }
} // end print
