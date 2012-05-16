/*
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */
"use strict"

var erf = function (errmsg, usrmsgArray) {
  var that
  that = new Error('')
  that.message = errmsg
  that.usrmsg = usrmsgArray
  return that
}

exports.erf = erf