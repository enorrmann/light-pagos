const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const paymentsAdapter = new FileSync('db/payments.json')
const failedPaymentAdapter = new FileSync('db/failed_payments.json')
const logAdapter = new FileSync('db/log.json')

const paymentsDb = low(paymentsAdapter);
const failedPaymentsDb = low(failedPaymentAdapter);
const logDb = low(logAdapter);

paymentsDb.defaults({ payments: [] }).write();
failedPaymentsDb.defaults({ failedPayments: [],failedRoutings: [] }).write();
logDb.defaults({ events: [] }).write();

let add = function (item) {
    paymentsDb.get('payments')
        .push(item)
        .write();

};
let get = function (hash) {
    return paymentsDb.get('payments')
    .find({ id: hash })
    .value();

};

let addFailedPayment = function (item) {
    item.time = new Date();
    failedPaymentsDb.get('failedPayments')
    .push(item)
    .write();
};
let addFailedRouting = function (item) {
    item.time = new Date();
    failedPaymentsDb.get('failedRoutings')
    .push(item)
    .write();
};

let logError = function (item) {
    item.time = new Date();
    item.eventType = 'ERROR';
    logDb.get('events')
        .push(item)
        .write();

};


module.exports = {
    add: add,
    get: get,
    addFailedPayment : addFailedPayment,
    addFailedRouting : addFailedRouting,
    logError:logError
}