const express = require('express')
const app = express()
const port = 3000

const logic = require('./logic.js');

app.get('/mpago/:payReq', (req, res) => {
    let payReq = req.params.payReq;
    logic.createPreference(payReq).then(function(response){
        //res.send(response);
        res.redirect(response.mp_response.sandbox_init_point);
    });

  
  
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
