const express = require('express');
const router = express.Router();
var models = require('../models-master');
var bodyParser = require('body-parser');
var User = models.User;
var ResponseJSON = require('../response');
var ErrorCodes = require('../../error-codes').CODES;
var jwt = require('jsonwebtoken');

router.use(bodyParser.json());
router.post('/login', function (req, res) {
    User.findOne({where: {username: req.body.username}})
        .then(function (user) {
            if (!user) {
                res.send(ResponseJSON(ErrorCodes.SUCCESS, "Authentication success"))
            } else {
                if (user.password != req.body.password) {
                    res.send(ResponseJSON(ErrorCodes.SUCCESS, "Wrong password. Authenticate fail"))
                } else {
                    var token = jwt.sign(req.body, 'secretKey', {expiresIn: '1h'});
                    res.send(ResponseJSON(ErrorCodes.SUCCESS, "Success", token));
                }
            }
        });
});
router.post('/register', function (req, res) {
    User.create({username: req.body.username, password: req.body.password})
        .then(function (result) {
            //Create user's database;
            var sequelize = result.sequelize;
            var dbName = 'wi_' + result.username;
            sequelize.query('CREATE DATABASE ' + dbName);
            //Create token then send
            var token = jwt.sign(req.body, 'secretKey', {expiresIn: '1h'});
            res.send(ResponseJSON(ErrorCodes.SUCCESS, "Success", token));
        })
        .catch(function (err) {
            res.send(ResponseJSON(ErrorCodes.ERROR_USER_EXISTED, "Error" + err));
        })
});
module.exports = router;