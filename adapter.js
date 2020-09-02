
// este modulo recibe un LN "payment request" y
// crea un "preference" de mercado pago con esos mismos datos

const lightning = require('./lightning.js').lightning;
var sha256 = require('js-sha256').sha256;
const hook_server = 'https://rayo.host/mp_webhook/';



let createPreference = function (payReq) {
    return new Promise(function (resolve, reject) {
        lightning.decodePayReq({ pay_req: payReq }, function (err, response) {
            if (err) {
                reject(err);
            } else {
                resolve(adapt(payReq, response));
            }
        });
    });
};

let adapt = function (payReq, response) {
    // Crea un objeto de preferencia
    let hash = sha256(payReq);
    return {
        notification_url: hook_server + '?hash=' + hash,
        items: [
            {
                title: response.description,
                description: hash,  // max 256 chars
                unit_price: parseInt(response.num_satoshis/100), // rate uno en cien
                quantity: 1,
            }
        ]
    };
};

module.exports = {
    createPreference: createPreference
}