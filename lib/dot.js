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

dot.file = path.join(process.cwd(), '/.state.json');

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
}


    
var emptybins = [
        {
            "bin": "shroud",
            "active": false,
            "binfiles": ["coora.js",
                        "README.md"]
        },
        {
            "bin": "megalopolis",
            "active": true,
            "binfiles": ["super.c",
                        "gracious.py"]
        }
];


dot.readstate = function ( cb ) {
    path.exists(this.file, function ( exists ) {
        var state;    
        if (exists) {
            fs.readFile(this.file, 'utf8', function (err, data) {
                if (err) throw err;
                state = JSON.parse(data);
                cb(state);
            }); //end readFile
        } else {
            state = emptybins;
            cb(state);
        }
    }); // end path.exists
}; // end init


dot.writestate = function (state) {
    var State =  JSON.stringify( state, null, 4 );
    console.log('writing state'); 
    fs.writeFile(this.file, State, 'utf8', function (err) { 
        if (err) return console.log(err);
        else console.log(State);
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


