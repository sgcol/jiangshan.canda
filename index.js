var server = require('http').createServer()
	, url = require('url')
	, path = require('path')
	, express = require('express')
	, app = express()
	, compression = require('compression')
	, bodyParser = require('body-parser')
    , cors =require('cors')
	, qs = require('querystring')
	, md5=require('md5')
	, getDB=require('./db.js')
    , httpf =require('httpf')
	, ObjectId =require('mongodb').ObjectId
	, {dedecimal, decimalfy, ID} =require('./etc.js')
	, rndstring=require('randomstring').generate
	, argv=require('yargs')
		.default('port', 7008)
		.argv
	, debugout =require('debugout')(argv.debugout)

require('colors');

app.use(express.static(path.join(__dirname, 'dist'), {maxAge:7*24*3600*1000, index: 'index.html' }));

server.on('request', app);
server.listen(argv.port, function () { console.log(`Listening on ${server.address().port}`.green) });

const default_user={balance:0};

Number.prototype.pad = function(size) {
	var s = String(this);
	while (s.length < (size || 2)) {s = "0" + s;}
	return s;
}

const datestring =(t)=>{
	return `${t.getFullYear().pad(4)}${(t.getMonth()+1).pad()}${t.getDate().pad()}`;
}

app.use(cors());
// app.use(compression);
var jsonBody=bodyParser.json();
app.use(jsonBody);

async function run() {
    var {db} =await getDB();
    app.all('/reg', httpf({name:'string', pass:'string', callback:true}, async function(name, pass, cb) {
        var req=this.req;
		var remoteAddress=req.headers['cf-connecting-ip']||req.headers['x-forwarded-for']||req.headers['X-Real-IP']||req.headers['x-real-ip']||req.connection.remoteAddress;

        var salt=rndstring(16);
        var pwd=md5(''+salt+pass);
        try {
            await db.users.insertOne({_id:name, salt, pwd, regTime:new Date(), lastTime:new Date(), regIP:remoteAddress, lastIP:remoteAddress});
        } catch(e) {
            return cb(e);
        }

        cb();
    }))
    app.all('/salt', httpf({name:'string', callback:true}, async function(name, cb) {
        try {
            var dbuser=await db.users.findOne({_id:name});
            if (!dbuser) return cb('没有这个账号');
            cb(null, dbuser.salt);
        } catch(e) {
            cb(e);
        }
    }))
    app.all('/login', httpf({name:'string', pwd:'string', callback:true}, async function(name, pwd, cb) {
        var req=this.req;
		var remoteAddress=req.headers['cf-connecting-ip']||req.headers['x-forwarded-for']||req.headers['X-Real-IP']||req.headers['x-real-ip']||req.connection.remoteAddress;

        try {
            var dbuser=await db.users.findOne({_id:name});
            if (!dbuser) return cb('没有这个账号');
            if (pwd!=dbuser.pwd) return cb('密码不正确');
            db.users.updateOne({_id:name}, {$set:{lastTime:new Date(), lastIP:remoteAddress}});
            cb();
        } catch(e) {
            cb(e);
        }
    }))
}

try {
    run();
} catch(e) {
    console.error(e);
    process.exit(-1);
}
