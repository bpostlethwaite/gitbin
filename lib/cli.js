//#!/usr/bin/env node
/* 
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */

var app = require('./commands.js')()

var args = process.argv.splice(2)
  , command = args.shift()


app.run(command, args)
