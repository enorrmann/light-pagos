const adapter = require('./adapter.js');
const mpago = require('./mpago.js');
const db = require('./db.js');
var sha256 = require('js-sha256').sha256;


const example_request = 'lnbc1200n1p05jrqrpp50dlh8kt5q6jyrll3jvrmxkz5saqwqd26yl2rnxewep0ghjftv74qdq6w4hzqcmpvmp6jgrrdahzqumpdsxqrrss9qtzqqqqqq9qsqsp5hmw4dwvmusjhpu60shacfp2e0jx4sqcxp3l87g72lspdtnj83t4srzjqwryaup9lh50kkranzgcdnn2fgvx390wgj5jd07rwr3vxeje0glcll6j39rxt9v7cyqqqqlgqqqqqeqqjqsxkhr7z588hzwmpz5try9vvs3a6z0r45m65lqq24vf3lhzny7mfy5mxymnm9859d6llvru6u2vca8cakat229af9d6gzkw40xg4hr9qpcdcge3';



/*
adapter.createPreference(example_request).then(function (preference) {
    mpago.createPreference(preference).then(function (mp_response) {
        let element = {
            pay_req : example_request,
            payment_method : 'MP',
            mp_response : mp_response, //esto no hace falta guardarlo, pues ya esta en mpago lo pongo para debug
            id : sha256(example_request)
        };

        db.add(element);

    }, function (err) {
        console.log(err);
    });
}, function (err) {
    console.log(err);
});

// el listener puede contener en la url el hash del lnpayment
// POST /xjrx5/?data.id=29340175&source_news=&type=payment
*/

mpago.getPaymentInfo(29340288).then(function (mp_response) {
    console.log(mp_response);
    if (mp_response.status == 'approved' && mp_response.status_detail == 'accredited') {
        console.log('hay que pagar ' + mp_response.hash);
    }

});

