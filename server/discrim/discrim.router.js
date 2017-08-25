var express = require('express');
var router = express.Router();
var discrimModel = require('./discrim.model');
var bodyParser = require('body-parser');

router.use(bodyParser.json());

router.post('/discrim/info', function (req, res) {
    discrimModel.getDiscrimInfo(req.body, function (status) {
        res.send(status);
    })
});

router.post('/discrim/new', function (req,res) {
    discrimModel.createNewDiscrim(req.body, function (status) {
        res.send(status);
    });
});

router.post('/discrim/edit', function (req, res) {
    discrimModel.editDiscim(req.body, function (status) {
        res.send(status);
    })
});

router.post('/discrim/delete',function (req,res) {
    discrimModel.deleteDiscrim(req.body, function (status) {
        res.send(status);
    });
});

module.exports = router;