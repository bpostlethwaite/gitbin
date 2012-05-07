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
var async = require('async');
var path = require('path');

/*
 * Command Namespace
 */
var commands = function () {};

commands.init = function () {
    console.log( 'Going to initialize: ', process.cwd() );
    return this.state
};

commands.add = function () {
    /*
     * Cut out command, leave args
     */
    var files = this.args.splice(1); 
    /*
     * Check for file arguements
     * and bin validity
     */
    if (files.length === 0) {
        this.state.err = true;
        this.state.errmsg = 'usage';
    }

    var bin = getActiveBin(this.state);
    /*
     * aysnc iter files, if file exists and is file
     * copy to activated bin, change state
     */
    async.every(files, path.exists, function(result){
        if (result) {
            // COPY FILES
            // Change state on success
            console.log('Files pass existence check');
        }
        else {
            console.log('One or more files do not exist');
        }
    }); // end async.every
    console.log( 'Adding files to bin: ', files );
    return this.state
}; // end commands.add

commands.bin = function () {
    var i;
    for (i in this.state) {
        console.log( this.state[i].binfiles );
    }
    return this.state
};

/*
 * Gets active bin, also checks bin's path.
 */
var getActiveBin = function(state) {
    var i, bin;
    for (i in state) {
        if (state[i].active) {
            bin = state[i].bin;
            
        } 
    }; 
}; // end getActiveBin

/*
var validate = {};
var validate.bin = function ( bin ) {
    path.exists(bin, function (exist) {
        if (exist) {
            return bin;
                }
                else {
                    
                }
            }); //end path.exist 
state.err = true;
                    state.errmsg = 'Bin: ' + bin + 'path does not exist',
                    , 'Please remove this bin from dot.js with <bin -d "bin"> command',
                    , 'or correct path to this directory';

*/
//var validate = {};
//var validate.file = function (file) {

exports.command = commands;