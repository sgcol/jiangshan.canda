const md5=require('md5')
    , {ObjectId} =require('mongodb')
    , request =require('request')
    , args=require('yargs')
    .default('pid', 1)
    .default('sid', 1)
    .default('type', 1)
    .default('userid', '11111111111')
    .default('ip', '127.0.0.1')
    .default('port', '80')
    .describe('port', 'server port')
    .default('money', 5)
    .argv;

var key= 'Q@ABc#d27poss', orderno=(new ObjectId()).toHexString(), score=Math.floor(args.money*10), pay_point=Math.floor(args.money*100);
var payserverurl={
    protocol: 'http:',
    port: args.port,
    hostname: args.ip,
    pathname: '/pay',
    search: "?" 
        + "TYPE=" + args.type 
        + "&PLATFORM_ID=" + args.pid 
        + "&SERVER_ID=" + args.sid 
        + "&PLATFORM_ORDER_ID=" +  orderno
        + "&USER_ID=" + args.userid 
        + "&GAME_POINT=" + score
        + "&PAY_POINT=" + pay_point 
        + "&SIGN=" + md5([args.pid, args.sid, orderno, args.userid, score, pay_point, key].join("_"))
};

request({ url: payserverurl, method: 'GET' }, function (err, header, body) {
    if (err) return console.error(err);
    console.log(body);
});
