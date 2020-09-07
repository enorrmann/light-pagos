const config = require('./config.js');
//https://api.mercadopago.com/v1/payments/29358696?access_token=
//https://api.mercadopago.com//merchant_orders/1728625282?access_token=


if (!config.MP_ACCESS_TOKEN) {
    console.log("WARNING !! NO HAY MP_ACCESS_TOKEN");
}

const ACCESS_TOKEN = config.MP_ACCESS_TOKEN;


// SDK de Mercado Pago
const mercadopago = require('mercadopago');

// Agrega credenciales
mercadopago.configure({
    access_token: ACCESS_TOKEN
});



let createPreference = function (preference) {
    return new Promise(function (resolve, reject) {
        mercadopago.preferences.create(preference).then(function (response) {
            // Este valor reemplazará el string "<%= global.id %>" en tu HTML
            global.id = response.body.id;
            console.log(response);
            resolve(
                {
                    id: response.body.id,
                    init_point: response.body.init_point,
                    notification_url: response.body.notification_url,
                    sandbox_init_point: response.body.sandbox_init_point,
                    init_point: response.body.init_point
                }

            );
        }).catch(function (error) {
            reject(error);
        });
    });
};



let getPaymentInfo = function (paymentId) {
    return new Promise(function (resolve, reject) {

        mercadopago.payment.findById(paymentId).then(function (res) {
            let response = res.body;
            let url = response.notification_url;
            let idx = url.indexOf("hash=") + 5;
            resolve(
                {
                    id: response.id,
                    notification_url: url,
                    hash: url.substring(idx),
                    status: response.status,
                    status_detail: response.status_detail
                }
            );
        }).catch(function (error) {
            reject(error);
        });
    });
};


module.exports = {
    createPreference: createPreference,
    getPaymentInfo: getPaymentInfo

}