var express = require('express');
var logic = require('../logic/logic.js');
var router = express.Router();

router.get('/', function (req, res, next) {
  console.log(req.query.pay_req);
  logic.canPay(req.query.pay_req).then(function (response) {

    res.render('pay',
      {
        response: JSON.stringify(response),
        pay_req: req.query.pay_req,
        title: 'options'
      }
    );
  }, function (err) {
    res.render('error', {
      error: err,
      message: "No puedo pagar eso"
    });
  });
});

module.exports = router;
