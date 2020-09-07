const adapter = require('./adapter.js');
const mpago = require('./mpago.js');
const db = require('./db.js');
const lnd = require('./lightning.js');
const lightning = lnd.lightning;
const router = lnd.router;
var sha256 = require('js-sha256').sha256;

// fee source http://preev.com/pulse/units:btc+usd/sources:bitstamp
const maxRoutingFeePercent = 0.10;  //@todo poner parametro de config maxRouteFee  0.10 = 10%

let clean = function (payReq) {
    let idx = payReq.indexOf("lnbc");
    return payReq.substring(idx);
};

let canPay = function (payReq) {
    return new Promise(function (resolve, reject) {
        lightning.decodePayReq({ pay_req: payReq }, function (err, decoded) {
            if (err) {
                let cause = { error: err, payReq: payReq };
                //db.logError(cause);
                db.addFailedRouting(cause);
                reject({error:err, mensaje: "El formato es incorrecto"});
            } else {

                let maxRouteFee = Math.ceil(decoded.num_satoshis * maxRoutingFeePercent);

                let queryRoutesReqLight = {
                    pub_key: decoded.destination,
                    amt: decoded.num_satoshis,
                    route_hints: decoded.route_hints,
                    fee_limit: { fixed: maxRouteFee } // percent | fixed // @todo calcular "a mano" para poder sumar los fees al pago
                };
                let queryRoutesReq = queryRoutesReqLight; // varibale para que sea facil cambiar entre queryRoutesReqLight y queryRoutesReqRouter

                // este hace que se caiga el servicio LND: ver https://github.com/lightningnetwork/lnd/issues/4594
                //let dest = Buffer.from(decoded.destination, 'hex');
                //let queryRoutesReqRouter = { dest: dest, amt_sat: decoded.num_satoshis};
                //router.estimateRouteFee(queryRoutesReq, function (err, response) {
                lightning.queryRoutes(queryRoutesReq, function (err, response) {
                    if (err) {
                        let cause = { error: err, req: queryRoutesReq };
                        db.addFailedRouting(cause);
                        reject({error:err, mensaje: "De momento no tenemos capacidad, pero estamos trabajando para agregar mas !"});
                    } else {
                        //console.log(decoded.payment_hash);
                        //console.log(decoded);
                        resolve({ canRoute: 'yes' });
                        // tengo que buscar payments para ver si ya lo pague, no invoices
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

// este metodo tiene que devolver directamente el preference de mpago si canPay lo permite
// es decir, retorna un preference de mpago
let initPayment = function (payment_request) {
    return new Promise(function (resolve, reject) {
        // verifica si puedo pagar
        canPay(payment_request).then(function (response) {
            // puego pagar
            //resolve({canPay:response,payment_request:payment_request});
            createPreference(payment_request).then(function (preference) {
                resolve(preference);
            }).catch(function (error) {
                // error al crear el preference
                reject(error);
            });

        }).catch(function (error) {
            // NO puego pagar por "error"
            reject(error);
        });
    });

};

module.exports = {
    initPayment: initPayment,
    payIfYouMust: payIfYouMust,
    canPay: canPay


}