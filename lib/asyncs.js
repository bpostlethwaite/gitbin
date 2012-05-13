/* 
 * dotjs - collect dotfiles and configs easily for use with git
 *
 * Copyright (c) <2012> Ben Postlethwaite
 * See the file license.txt for copying permission.
 *
 */


module.exports = function asyncs () { 

  var that = {} 


  //
  // Async Funcs taken directly from
  // Isaac Z. Schlueter @
  // http://howtonode.org/flow-control-in-npm
  // Modified by Ben Postlethwaite May 2012
  //
  that.asyncMap = function (list, fn, cb_) {
    if (typeof cb_ !== "function") throw new Error(
      "No callback provided to asyncMap")
    var data = []
    ,   errState = null
    , l = list.length
    if (!l) return cb_(null, [])
    function cb (er, d) {
      if (errState) return
      if (arguments.length > 1) data = data.concat(d)
      if (er) return cb_(errState = er, data)
      else if (-- l === 0) cb_(errState, data ) //THIS IS THE MAIN CALL BACK
    }
    list.forEach(function (ar) { fn(ar, cb) })
  }  // end my.asyncMap
  //
  // Async Funcs taken directly from
  // Isaac Z. Schlueter @
  // http://howtonode.org/flow-control-in-npm
  // Modified by Ben Postlethwaite May 2012
  // Perhaps modify further to allow data concat in callbacks
  //
  that.chain = function () {
    var steps = Array.prototype.slice.call(arguments)
    , cb_ = steps.pop()
    , n = 0
    , l = steps.length
    nextStep(cb)
    function cb (er) {
      if (er) return cb_(er)
      if (++ n === l) return cb_(null)
      nextStep(cb)
    }
    function nextStep (cb) {
      var s = steps[n]
      // skip over falsey members
      if (!s) return cb()
      // simple function
      if (typeof s === "function") return s(cb)
      if (!Array.isArray(s)) throw new Error(
        "Invalid thing in chain: "+s)
      var obj = null
      , fn = s.shift()
      if (typeof fn === "object") {
        // [obj, "method", some, args]
        obj = fn
        fn = obj[s.shift()]
      }
      if (typeof fn !== "function") throw new Error(
        "Invalid thing in chain: "+typeof(fn))
      fn.apply(obj, s.concat(cb))
    }
  }  // end my.chain
  
  return that 
  
}  // end makeasync



