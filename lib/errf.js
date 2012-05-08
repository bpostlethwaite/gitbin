/* 
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */
"use strict";

function errf (message, usagebool) {
    var that = {};
    that.name = 'Error';
    that.message = message;
    that.usage = usagebool;
    return that;
};

exports.errf = errf;