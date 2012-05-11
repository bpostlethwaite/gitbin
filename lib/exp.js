
function chain () {
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
} // end my.chain


var arg = {};


function changearg (bell, cb) {
    bell.name = 1;
    cb(null);
};

function changeargII (bell, cb) {
    bell.name += 1;
    cb(null);
};

function printarg (bell, cb) {
    console.log(arg.name);
    cb(null);
};

function cb_ (err,data) {
    if (err) throw err;
};

chain( [ changearg, arg] 
       ,[ changeargII, arg]   
       ,[ printarg, arg]        
       ,  cb_ );      
