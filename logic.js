const adapter = require('./adapter.js');
const mpago = require('./mpago.js');
const db = require('./db.js');
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

let getPaymentInfo = function () {

};

/*mpago.getPaymentInfo(29341344).then(function (mp_response) {
    console.log(mp_response);
    if (mp_response.status == 'approved' && mp_response.status_detail == 'accredited') {
        console.log('hay que pagar ' + mp_response.hash);
        console.log('hay que pagar ' + db.get(mp_response.hash).pay_req);

    }

});*/

module.exports = {
    createPreference: createPreference,
    getPaymentInfo: getPaymentInfo

}