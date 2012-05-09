/* 
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */
"use strict";
/* 
 * Module Dependencies
 */
var path = require('path');
var fs = require('fs');
    
/* 
 * Application object
 */

var dot = function () {};

dot.file = path.join(__dirname, '/.state.json');

dot.usage = function () {
    dot.print( [
    '',
    'dotjs - Gather scattered files into directory for use with git',
    '',
    'Usage:',
    '',
    '      dotjs init                   - Initializes directory.',
    '      dotjs add <file1> <filen>    - Adds n file[s] to bin.',
    '      dotjs remove <file1> <filen> - Removes n file[s] from bin.',
    '      dotjs checkout <bin>         - Switches to bin <bin>.',
    '      dotjs bin                    - Lists initialized bins. Bin in focus is starred.',
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

dot.start = function ( cb ) {
    dot.readstate( cb )
}; // end dot.start

dot.readstate = function ( cb ) {
    var that = this;
    path.exists(that.file, function ( exists ) {
        var state;    
        if (exists) {
            fs.readFile(that.file, 'utf8', function (err, data) {
                if (err) {
                    console.log('Yep problem reading file');
                    cb(err);
                }
                else {
                    state = JSON.parse(data);
                    cb(null, state);
                }
            }); //end readFile
        } else {
            state = emptybins;
            cb(null, state);
        }
    }); // end path.exists
}; // end readstate


dot.writestate = function (state) {
    var State =  JSON.stringify( state, null, 4 );
    console.log('writing state'); 
    fs.writeFile(this.file, State, 'utf8', function (err) { 
        if (err) {
            console.log(err);
        }
        else {
            console.log('wrote state');
        }
    }); // end writeFile
};// end writestate

dot.print = function ( strlist ) {
    var i;
    if ( strlist.length  > 0 ) {
        for (i = 0; i < strlist.length; i += 1) {
            console.log(strlist[i]);
        }
    }
}; // end print    


exports.dotjs = dot;


