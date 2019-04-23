'use strict';
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose');

var config = require('../config/appConfig');
var Feeds = require("../models/feed");
var User = require('../models/User');


/**
 * List of Feeds
 */
router.get('/feedlist', function (req, res) {
    Feeds.find().sort('-created').populate('user', 'feedUrl').exec(function (err, feeds) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(feeds);
        }
    });
});

/**
 * Create a feed
 */
router.post('/feed', function (req, res) {
    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    jwt.verify(token, config.jwt_key, function (err, decoded) {

        if (err)
            return res.status(500).send({
                auth: false,
                message: 'Failed to authenticate token.'
            });
        var email_id = decoded.email;
        var user_id = decoded.userId;

        User.findById(user_id).exec().then(user => {
            if (user.length < 1) {
                return res.json({
                    message: "Provided User is not registered"
                });
            } else {
                const feed = new Feeds({
                    // _id: new mongoose.Types.ObjectId(),
                    feedUrl: req.body.feedurl,
                    user: user_id

                });
                feed.save().then(feed => {
                    return res.status(200).json({
                        feed,
                        user
                        // decoded
                    });
                })
            }
        });
    });
});



/**
 * Delete a feed
 */
router.delete('/:feedId', function (req, res) {

    var token = req.headers['x-access-token'];
    if (!token) return res.status(401).send({
        auth: false,
        message: 'No token provided.'
    });

    jwt.verify(token, config.jwt_key, function (err, decoded) {

        if (err)
            return res.status(500).send({
                auth: false,
                message: 'Failed to authenticate token.'
            });
        var email_id = decoded.email;
        var user_id = decoded.userId;
        User.findById(user_id).exec().then(user => {
            if (user.length < 1) {
                return res.json({
                    message: "Provided User is not registered"
                });
            } else {
                Feeds.remove({

                        _id: req.params.feedId
                    })
                    .exec()
                    .then(result => {
                        res.status(200).json({
                            result,
                            message: 'User feed record deleted'
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
            }
        });
    });
});

module.exports = router;