const adapter = require('./adapter.js');
const mpago = require('./mpago.js');
const db = require('./db.js');
const lightning = require('./lightning.js').lightning;
var sha256 = require('js-sha256').sha256;

let clean = function (payReq) {
    let idx = payReq.indexOf("lnbc");
    return payReq.substring(idx);
};

let createPreference = function (paramPayReq) {
    let payReq = clean(paramPayReq);
    return new Promise(function (resolve, reject) {
        adapter.createPreference(payReq).then(function (preference) {
            mpago.createPreference(preference).then(function (mp_response) {
                let element = {
                    pay_req: payReq,
                    payment_method: 'MP',
                    mp_response: mp_response,
                    id: sha256(payReq)
                };

                db.add(element);
                resolve(element);

            }, function (err) {
                reject(err);
            });
        }, function (err) {
            reject(err);
        });

    });
}

let payIfYouMust = function (payment_id, hash) {
    return new Promise(function (resolve, reject) {
        mpago.getPaymentInfo(payment_id, hash).then(function (mp_response) {
            console.log(mp_response);
            // mp_response.notification_url contiene hash=sd78d8f6
            if (mp_response.status == 'approved' && mp_response.status_detail == 'accredited') {
                let payment_request = db.get(mp_response.hash).pay_req;

                console.log('hay que pagar ' + mp_response.hash);
                console.log('hay que pagar ' + payment_request);
                let call = lightning.sendPayment({});
                call.on('data', function(response) {
                    // A response was received from the server.
                    console.log(response);
                    resolve(response);
                  });
 
                call.write({ payment_request: payment_request });
            }
            
        }).catch(function (error) {
            reject(error);
        });
    });
};



module.exports = {
    createPreference: createPreference,
    payIfYouMust: payIfYouMust

}