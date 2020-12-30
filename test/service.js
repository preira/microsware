"use strict";
// use microsware has framework to share repetitive implementation
exports.__esModule = true;
var microsware_1 = require("../lib/microsware");
// TODO:
// set up routes
var server = new microsware_1.MSWService({
    service: {
        name: 'TemplateService',
        version: '0.0.1',
        uuid: 'XXXX-XXXX-XXXX-XXXX'
    },
    server: { httpport: 3000 },
    log: {
        isDebug: true,
        isTrace: true,
        isWarn: true,
        isLocalOnly: true
    }
});
server
    .api()
    .route('/test$')
    .get(get('/test$'))
    .post(post('/test$'))
    .put(put('/test$'))["delete"](del('/test$'))
    .patch(patch('/test$'));
//TODO: add API call to self to test a service calling a service
var twoservices = '/test/two-services$';
server
    .api()
    .route(twoservices)
    .post(post(twoservices));
//TODO: add API call to self to timeout
var timeoutservices = '/test/two-services$';
server
    .api()
    .route(timeoutservices)
    .post(post(timeoutservices));
function get(url) {
    var logger = server.logger("Template server - get '" + url + "'");
    return function (req, res, next) {
        var data = req.query.data;
        logger.info(data);
res.setHeader('Yet-another-header', 'header value')
        res.status(200).json({ 'echo': data }).end();
    };
}
function post(url) {
    var logger = server.logger("Template server - get '" + url + "'");
    return function (req, res, next) {
        var data = req.body.data;
        logger.info(data);
        res.status(200).json({ 'echo': data }).end();
    };
}
function put(url) {
    var logger = server.logger("Template server - get '" + url + "'");
    return function (req, res, next) {
        var param = req.params.data;
        var body = req.body.data;
        logger.info(param);
        logger.info(body);
        res.status(201).json({
            'echo param': param,
            'echo body': body
        }).end();
    };
}
function del(url) {
    var logger = server.logger("Template server - get '" + url + "'");
    return function (req, res, next) {
        var param = req.params.data;
        logger.info(param);
        res.status(200).json({
            'echo param': param
        }).end();
    };
}
function patch(url) {
    var logger = server.logger("Template server - get '" + url + "'");
    return function (req, res, next) {
        var param = req.params.data;
        var body = req.body.data;
        logger.info(param);
        logger.info(body);
        res.status(200).json({
            'echo param': param,
            'echo body': body
        }).end();
    };
}
server.run();
