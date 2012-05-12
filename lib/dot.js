/* 
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */

"use strict";
var path = require('path')
,   fs = require('fs')
,   futil = require('./futil').makeutil()    

// 
// ## Main Application object ##
// Note: Using functional pattern
// for object creation. No usage of 'new'.
//
var app = function (statefile) {    
    var that = {};
    that.statefile = statefile;
//
// Attempt to read statefile upon init.
//

//
// ## Start application function
//
    that.start = function ( cb ) {
        that.readstate( cb );
    }; // end start


//
// ## Prints application usage info ##
//
    that.usage = function () {
        print( [
            '',
            'dotjs - Gather scattered files into directory for use with git',
            '',
            'Usage:',
            '',
            '      dotjs init                   - Initializes directory.',
            '      dotjs add <file1> <filen>    - Adds n file[s] to bin.',
            '      dotjs remove <file1> <filen> - Removes n file[s] from bin.',
            '      dotjs bin                    - Lists initialized bins. Bin in focus is starred.',
            '      dotjs checkout <bin>         - Switches to bin <bin>.',
            '      dotjs push                   - Copies scattered files into bin.',
            '      dotjs pull                   - Copies bin files into filesystem [has saftey].',
            '      dotjs status                 - Prints bin and file status.',    
            '',
            'Author: Ben Postlethwaite'
        ]);
    };

    
    var emptybins = [
        {
            "bin": "",
            "active": true,
            "binfiles": {}
        }
    ];

    var print = function ( strlist ) {
        var i;
        if ( strlist.length  > 0 ) {
            for (i = 0; i < strlist.length; i += 1) {
                console.log(strlist[i]);
            }
        }
    }; // end print

    return that;
    
};

exports.app = app;


