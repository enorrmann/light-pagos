const express = require('express')
const app = express()
const port = 3000

const logic = require('./logic.js');

app.get('/mpago/:payReq', (req, res) => {
  let payReq = req.params.payReq;
  logic.createPreference(payReq).then(function (response) {
    //res.send(response);
    //res.redirect(response.mp_response.sandbox_init_point);
    res.redirect(response.mp_response.init_point);
  });
});

//?data_id=29359105&hash=a0c036ff008dff835d55994084a8fa0377916b56a67440758cb00ace9a39a99e&type=payment
//{"action":"payment.created","api_version":"v1","data":{"id":"29359105"},"date_created":"2020-08-31T12:39:42Z","id":6353676407,"live_mode":false,"type":"payment","user_id":"90706324"}
//http://localhost:3000/mp_webhook?data_id=29359105&hash=a0c036ff008dff835d55994084a8fa0377916b56a67440758cb00ace9a39a99e&type=payment
app.post('/mp_webhook', (req, res) => {
  console.log("req.query");
  console.log(req.query);
  console.log("req.body");
  console.log(req.body);

  if (req.query.type && req.query.type == 'payment') {
    console.log("es n payment");
    logic.payIfYouMust(req.query['data.id'], req.query.hash).then(function (response) { });
  }

  res.send("ok");

});

app.get('/can_pay/:payReq', (req, res) => {
  let payReq = req.params.payReq;
  logic.canPay(payReq).then(function (response) {

    //res.send(response);
    res.send(response);
  }, function (err) {
    console.log('error aca antes');
    //console.log(err);
    console.log('error aca afuera');
    res.send(err);
  });


});

if (!process.env.LND_DIR) {
  console.log("debe setear env LND_DIR");
} else {
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  });

}
