const fs = require('fs');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const config = require('./config/config.js');

const loaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};


if (!config.LND_DIR) {
    console.log("debe setear env LND_DIR");
    return;
}

const LND_DIR = config.LND_DIR;
const MACAROON_FILE = LND_DIR + "data/chain/bitcoin/mainnet/admin.macaroon";
const TLS_FILE = LND_DIR + 'tls.cert';

const packageDefinition = protoLoader.loadSync(['lnd.proto', 'router.proto'], loaderOptions);

const lnrpc = grpc.loadPackageDefinition(packageDefinition).lnrpc;
const routerrpc = grpc.loadPackageDefinition(packageDefinition).routerrpc;

const macaroon = fs.readFileSync(MACAROON_FILE).toString('hex');
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
const lndCert = fs.readFileSync(TLS_FILE);
const sslCreds = grpc.credentials.createSsl(lndCert);
const macaroonCreds = grpc.credentials.createFromMetadataGenerator(function (args, callback) {
    let metadata = new grpc.Metadata();
    metadata.add('macaroon', macaroon);
    callback(null, metadata);
});
let creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
let lightning = new lnrpc.Lightning('localhost:10009', creds);
let router = new routerrpc.Router('localhost:10009', creds);


module.exports = {
    lightning: lightning,
    router: router
}