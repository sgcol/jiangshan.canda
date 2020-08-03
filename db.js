var easym=require('gy-easy-mongo')
, async=require('async')
, argv =require('yargs')
  .demand('mongo')
  .describe('mongo', '--mongo=[mongodb://][usr:pwd@]ip[:port][,[usr:pwd@]ip[:port]]/db, 参考https://docs.mongodb.com/manual/reference/connection-string/')
  .argv;

var __stored_db=null;
var q=async.queue(function (extern_callback, queue_callback) {
  (function(cb) {
    if (__stored_db) return cb(null, __stored_db, easym);
    else new easym.DbProvider().init(argv.mongo, {exists:[
        {bills:{index:['status', 'time', 'type', {userid:1, used:1, time:-1, lasttime:-1, paidmoney:1, money:1}]}},
        {users:{index:['acl', 'merchantid']}},
        ]}, 
        function(err, db) {
          if (err) return cb(err);
          __stored_db=db;
          cb(null, db, easym);
      });  
  })(function() {
    extern_callback.apply(null, arguments);
    queue_callback();
  })
});
module.exports=function(callback) {
  if (typeof callback=='function') return q.push(callback);
  return new Promise((resolve, reject)=>{
    q.push((err, db, dbm)=>{
      if (err) return reject(err);
      resolve({db, dbm});
    })
  })
}