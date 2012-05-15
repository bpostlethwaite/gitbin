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
  // Colorized output for error logging    
  that.green = '\u001b[1;32m' 
  that.grey  = '\u001b[1;30m' 
  that.red   = '\u001b[1;31m' 
  that.blue  = '\u001b[34m'
  that.reset = '\u001b[0m' 
  return that 
} 

exports.erf = erf 