const fs = require('fs');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const loaderOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};
const LND_DIR = '/home/emilio/.lnd/';
const packageDefinition = protoLoader.loadSync('lnd.proto', loaderOptions);
const lnrpc = grpc.loadPackageDefinition(packageDefinition).lnrpc;
const macaroon = fs.readFileSync(LND_DIR + "data/chain/bitcoin/mainnet/admin.macaroon").toString('hex');
process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
const lndCert = fs.readFileSync(LND_DIR + 'tls.cert');
const sslCreds = grpc.credentials.createSsl(lndCert);
const macaroonCreds = grpc.credentials.createFromMetadataGenerator(function (args, callback) {
    let metadata = new grpc.Metadata();
    metadata.add('macaroon', macaroon);
    callback(null, metadata);
});
let creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
let lightning = new lnrpc.Lightning('localhost:10009', creds);

module.exports = {
    lightning: lightning
}