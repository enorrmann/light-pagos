const adapter = require('./adapter.js');
const mpago = require('./mpago.js');
const db = require('./db.js');
const lnd = require('./lightning.js');
const lightning = lnd.lightning;
const router = lnd.router;
var sha256 = require('js-sha256').sha256;

let clean = function (payReq) {
    let idx = payReq.indexOf("lnbc");
    return payReq.substring(idx);
};

let canPay = function (payReq) {
    return new Promise(function (resolve, reject) {
        lightning.decodePayReq({ pay_req: payReq }, function (err, decoded) {
            if (err) {
                db.logError(err);
                reject(err);
            } else {

                let queryRoutesReq = { pub_key: decoded.destination, amt: decoded.num_satoshis, route_hints: decoded.route_hints };
                lightning.queryRoutes(queryRoutesReq, function (err, response) {
                    if (err) {
                        let cause = { error: err, req: queryRoutesReq, payReq: payReq };
                        db.addFailedPayment(cause)
                        reject(cause);
                    } else {
                        console.log(decoded.payment_hash);
                        console.log(decoded);
                        resolve(response);
                        // tengo que buscar payments, no invoices
                        /*lightning.lookupInvoice({r_hash_str:decoded.payment_hash}, function (err, response) {
                            if (err) {
                                //let cause = { error: err, req: queryRoutesReq, payReq: payReq };
                                //db.addFailedPayment(cause)
                                reject(err);
                            } else {
                                resolve(response);
                            }
                        });*/
                    }
                });
            };
        });
    });
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
    console.log('recibida llamada ');
    return new Promise(function (resolve, reject) {
        mpago.getPaymentInfo(payment_id, hash).then(function (mp_response) {
            console.log(mp_response);
            // mp_response.notification_url contiene hash=sd78d8f6
            if (mp_response.status == 'approved' && mp_response.status_detail == 'accredited') {
                let payment_request = db.get(mp_response.hash).pay_req;

                console.log('hay que pagar ' + mp_response.hash);
                console.log('hay que pagar ' + payment_request);
                let call = router.sendPaymentV2({});
                call.on('data', function (response) {
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
    payIfYouMust: payIfYouMust,
    canPay: canPay

}