//TEST-407d0c45-5c42-4f20-baf2-c4d1112f82b4
//TEST-8317557184416581-082813-8f516ba2d111ac8c5eace08afe0ee64a-90706324


//https://api.mercadopago.com/v1/payments/29358696?access_token=TEST-8317557184416581-082813-8f516ba2d111ac8c5eace08afe0ee64a-90706324#json
//https://api.mercadopago.com//merchant_orders/1728625282?access_token=TEST-8317557184416581-082813-8f516ba2d111ac8c5eace08afe0ee64a-90706324


const ACCESS_TOKEN = 'TEST-8317557184416581-082813-8f516ba2d111ac8c5eace08afe0ee64a-90706324';

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
            resolve(
                {
                    id: response.body.id,
                    init_point: response.body.init_point,
                    notification_url: response.body.notification_url,
                    sandbox_init_point: response.body.sandbox_init_point
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