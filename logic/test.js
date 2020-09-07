const lnd = require('./lightning.js');
//const lightning = lnd.lightning;
//const router = lnd.router;

const walletKit = lnd.walletKit;

let request = {
    outpoint: {
        txid_str : '0178b8c137e0c3ba704aec231edd03d002c4433341b360324013d0eda2bcc836',
        output_index:0
    }
    ,
    //</OutPoint>target_conf: <uint32>, 
    sat_per_byte: 13
    //</uint32>force: <bool>, 
};
walletKit.bumpFee(request, function(err, response) {
    console.log(response);
  });


/*
let call = router.sendPaymentV2({
    payment_request: 'lnbc1250n1p04qz5jpp52xhlwfsjf5jn24r0c0e35fq8a7mwfmq8yyvjntf9j2qt00g6dmtqdq9gdfyxcqzpgxqyz5vqsp5gtq0afq6jf0dt6dmf4tfl2atrd3777ww5h0mvjtfzug377dku3nq9qy9qsqqg99a7fkwccj422q90h234v2v9lh0epl0nfwhzwc9grgwgtg5ec4efanlcfx75z5u90mtfh5cc7arh75vaaasepsvyk9x59ujscfzccpjwlcxq',
    timeout_seconds: 1200,
    fee_limit_sat: 120
});

call.on('data', function (response) {
    console.log("********response********");
    console.log(response);
});
call.on('status', function (status) {
    console.log("********status********");
    console.log(status);
});
call.on('end', function () {
    console.log("********END********");
});
*/