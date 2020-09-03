const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const paymentsAdapter = new FileSync('payments.json')
const failedPaymentAdapter = new FileSync('failed_payments.json')
const logAdapter = new FileSync('log.json')

const paymentsDb = low(paymentsAdapter);
const failedPaymentsDb = low(failedPaymentAdapter);
const logDb = low(logAdapter);

paymentsDb.defaults({ payments: [] }).write();
failedPaymentsDb.defaults({ failedPayments: [] }).write();
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
    logError:logError
}