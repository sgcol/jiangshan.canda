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
    , fetch =require('node-fetch')
    , serverip=require('gy-local-ip')
	, argv=require('yargs')
		.default('port', 7008)
        .default('gameserver', ':7755')
        .describe('gameserver', '[ip]:port')
        .describe('payserver', '[ip]:port')
        .demandOption(['gameserver', 'payserver'])
		.argv
	, debugout =require('debugout')(argv.debugout)

require('colors');

app.use(express.static(path.join(__dirname, 'dist'), {maxAge:7*24*3600*1000, index: 'index.html' }));

server.on('request', app);
server.listen(argv.port, function () { console.log(`Listening on ${server.address().port}`.green) });

const default_user={balance:0};

function ipportfromstring(str, defaultip) {
    var [ip, port]=str.split(':');
    if (!ip) ip=defaultip||serverip;
    return {ip, port};
}
const gameserver=ipportfromstring(argv.gameserver), payserver=ipportfromstring(argv.payserver, '127.0.0.1');

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
    app.all('/gs', (req, res)=>{
        res.send(gameserver);
    })
    // method: ['ALIPAY'|'WECHATPAY'|'ALIPAY.WEB']
    app.all('/createOrder', httpf({name:'string', method:'string', money:'number', callback:true}, async function(name, method, money, callback) {
        var req=this.req, basepath=argv.host||url.format({protocol:req.protocol, host:req.headers.host, pathname:url.parse(req.originalUrl).pathname});
        try {
            var id=new ObjectId();
            var orderid=id.toHexString();
            // if (method=='ceshi') {
            //     await db.bills.insertOne({_id:id, name, money, method, time:new Date(), status:'paid', ceshi:true});
            //     await makeItDone(orderid);
            //     return callback('ceshi wancheng');
            // }
            var data = {
                method:method=='ALIPAY.WEB'?'pay.webpay':'pay.qrcodepay',
                merchant_no:account.partner,
                payment_method:method=='ALIPAY.WEB'?'ALIPAY':method,
                'out_order_no' : orderid,
                trans_currency:'CAD',
                trans_amount:money,
                description:'游戏充值',
                'notify_url' : url.resolve(basepath, 'done'),
                'return_url' : url.resolve(basepath, 'return'),
            };            
            var request_url = 'https://open.snappay.ca/api/gateway';
            var res=await fetch(request_url, {method:'post', body:JSON.stringify(makeSign(data, account)), headers:{ 'Content-Type': 'application/json' }})
            var ret=await res.json();
            if (ret.code!='0') return callback(ret.msg);
            var data=ret.data[0];
            await db.bills.insertOne({_id:id, name, money, method, time:new Date(), status:'waitforpaying', snappay_data:ret});
            
            var ret={to:data.qrcode_url};
            ret.pay_type=method;
            callback(null, ret);
        } catch(e) {
            callback(e);
        }
    }))
    app.all('/done', async function(req, res) {
        var r=req.body, sign=r.sign;
        if (makeSign(r).sign!=sign) return res.send({err:'sign error'});
        if (r.errCode!='00') return res.send({err:'code is not double zero'});
		try {
            await makeItDone(r.orderId, r);
            res.send('SUCCESS');
        }catch (err){
            return res.send({err:err});
        };
	});
    app.all('/return', (req, res)=>{
        res.send('充值成功');
    })
	async function makeItDone(orderid, data, callback) {
		callback=callback||function(err, r){
            if (err) throw err;
            return r;
        };
        try {
    		var {value:bill}=await db.bills.findOneAndUpdate({_id:ObjectId(orderid), used:{$ne:true}}, {$set:{used:true, status:'completed', lasttime:new Date(), snappay_result:data}}, {w:'majority'});
            if (!bill) {
                return callback('no such order');
            }
            // call gameserver
            var key= 'Q@ABc#d27poss', orderno=orderid, score=Math.floor(bill.money*10), pay_point=Math.floor(bill.money*100);
            var payserverurl={
                protocol: 'http:',
                port: payserver.port,
                hostname: payserver.ip,
                pathname: '/pay',
                search: "?" 
                    + "TYPE=" + 1 
                    + "&PLATFORM_ID=" + 1 
                    + "&SERVER_ID=" + 1 
                    + "&PLATFORM_ORDER_ID=" +  orderno
                    + "&USER_ID=" + ELFHash(bill.name) 
                    + "&GAME_POINT=" + score
                    + "&PAY_POINT=" + pay_point 
                    + "&SIGN=" + md5([1, 1, orderno, ELFHash(bill.name), score, pay_point, key].join("_"))
            };
            await fetch(url.format(payserverurl), {method:'GET'});
            return callback();
        } catch(e) {
            return callback(e);
        }
    }

}

const account= {app_id:'2d636096049ad188', partner:'902000075306', privateKey:'94ed782845a2cdd9bd38df4c57485fde'};
Number.prototype.pad = function(size) {
	var s = String(this);
	while (s.length < (size || 2)) {s = "0" + s;}
	return s;
}

const timestring =(t)=>{
    return `${t.getUTCFullYear().pad(4)}-${(t.getUTCMonth()+1).pad()}-${t.getUTCDate().pad()} ${t.getUTCHours().pad()}:${t.getUTCMinutes().pad()}:${t.getUTCSeconds().pad()}`;
}

const makeSign=function(data, account, options) {
    delete data.sign;
    var message ='', o=Object.assign({app_id:account.app_id, version:'1.0', format:'JSON', sign_type:'MD5', charset:'UTF-8', timestamp:timestring(new Date())}, data);
    Object.keys(o).sort().map((key)=>{
        if (key=='sign') return;
        if (key=='sign_type' && ((!options) || (!options.includeSignType))) return;
        message+=''+key+'='+o[key]+'&';
    })
    var encoded_sign=md5(message.substr(0, message.length-1)+account.privateKey);
    o['sign'] = encoded_sign.toLowerCase();
    return o;
}

function ELFHash(str) {
  str += "";
  var hash = 0;
  var x = 0,
    i = 0;
  while (i < str.length) {
    hash = (hash << 4) + str.charCodeAt(i++);
    hash = parseFloat(hash >>> 0);
    if ((x = parseFloat((hash & 0xf0000000) >>> 0)) != 0) {
      hash ^= x >>> 24;
      hash &= ~x;
      hash = hash >>> 0;
    }
  }
  return hash & 0x7fffffff;
}

try {
    run();
} catch(e) {
    console.error(e);
    process.exit(-1);
}
