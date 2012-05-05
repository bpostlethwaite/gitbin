/* 
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */

/* 
 * Module Dependencies
 */


    
/* 
 * Application object
 */

"use strict";

var dot = function () {};
var path = require('path');
var fs = require('fs');
var file = path.join(process.cwd(), '/.state.json');

dot.command = require('./commands');

dot.usage = [
    '',
    'dotjs - Gather scattered files into directory for use with git',
    '',
    'Usage:',
    '',
    '      dotjs init                  - Initializes directory.',
    '      dotjs add <file1> <filen>   - Adds n file[s] to bin.',
    '      dotjs checkout <bin>        - Switches to bin <bin>.',
    '      dotjs bin                   - Lists initialized bins.',
    '      dotjs push                  - Copies scattered files into bin.',
    '      dotjs pull                  - Copies bin files into filesystem [has saftey].',
    '      dotjs status                - Prints bin and file status.',    
    '',
    'Author: Ben Postlethwaite'
];

var emptybins = { 
    "bins": [ 
        {
            "bin": "shroud",
            "active": false,
            "binfiles": []
        },
        {
            "bin": "megalopolis",
            "active": false,
            "binfiles": []
        }
    ]
};

dot.access = function ( cb ) {
    path.exists(file, function ( exists ) {
        var state;    
        if (exists) {
            fs.readFile(file, 'utf8', function (err, data) {
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

exports.dotjs = dot;

