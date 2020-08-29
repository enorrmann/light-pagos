const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter);

db.defaults({ payments: [], user: {}, count: 0 }).write();

let add = function (item) {
    db.get('payments')
        .push(item)
        .write();

};
let get = function (hash) {
    return db.get('payments')
    .find({ id: hash })
    .value();

};


module.exports = {
    add: add,
    get: get
}