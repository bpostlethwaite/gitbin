/* 
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */
"use strict";

var errf = function (msg, usagebool) {
    var that;
    that = new Error(''); 
    that.message = msg;
    that.usage = usagebool;
    // Colorized output for error logging    
    that.red   = '\u001b[31m';
    that.blue  = '\u001b[34m';
    that.reset = '\u001b[0m';
    return that;
};

exports.errf = errf;