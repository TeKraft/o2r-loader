/* eslint-env mocha */
const assert = require('chai').assert;
const request = require('request');
const config = require('../config/config');

const host = 'http://localhost:'  + config.net.port;
const cookie = 's:C0LIrsxGtHOGHld8Nv2jedjL4evGgEHo.GMsWD5Vveq0vBt7/4rGeoH5Xx7Dd2pgZR9DvhKCyDTY';
const requestLoadingTimeout = 20000;


describe('API basics', function () {

    var compendium_id = '';

    describe('create new compendium based on a zenodo record', () => {
        it('zenodo record with zip file: should respond with a compendium ID', (done) => {
            let form = {
                zenodo_url: 'https://sandbox.zenodo.org/record/69114',
                filename: 'metatainer.zip',
                content_type: 'compendium_v1'
            };

            let j = request.jar();
            let ck = request.cookie('connect.sid=' + cookie);
            j.setCookie(ck, host);

            request({
                uri: host + '/api/v2/compendium',
                method: 'POST',
                jar: j,
                form: form,
                timeout: requestLoadingTimeout
            }, (err, res, body) => {
                assert.ifError(err);
                assert.equal(res.statusCode, 200);
                assert.isObject(JSON.parse(body), 'returned JSON');
                assert.isDefined(JSON.parse(body).id, 'returned id');
                compendium_id = JSON.parse(body).id;
                done();
            });
        }).timeout(20000);

        it('invalid zenodo URL: should respond with an error 404', (done) => {
            let form = {
                zenodo_url: 'htts://sandbox.zenodo.org/record/69114',
                filename: 'metatainer.zip',
                content_type: 'compendium_v1',
            };

            let j = request.jar();
            let ck = request.cookie('connect.sid=' + cookie);
            j.setCookie(ck, host);

            request({
                uri: host + '/api/v2/compendium',
                method: 'POST',
                jar: j,
                form: form,
                timeout: requestLoadingTimeout
            }, (err, res, body) => {
                assert.ifError(err);
                assert.equal(res.statusCode, 404);
                assert.isUndefined(JSON.parse(body).id, 'returned no id');
                assert.propertyVal(JSON.parse(body), 'error', 'zenodo URL is invalid');
                done();
            });
        }).timeout(10000);

        it('invalid host (not a zenodo record): should respond with an error 403', (done) => {
            let form = {
                zenodo_url: 'https://sandbox.ODONEZ.org/record/69114',
                filename: 'metatainer.zip',
                content_type: 'compendium_v1',
            };

            let j = request.jar();
            let ck = request.cookie('connect.sid=' + cookie);
            j.setCookie(ck, host);

            request({
                uri: host + '/api/v2/compendium',
                method: 'POST',
                jar: j,
                form: form,
                timeout: requestLoadingTimeout
            }, (err, res, body) => {
                assert.ifError(err);
                assert.equal(res.statusCode, 403);
                assert.isUndefined(JSON.parse(body).id, 'returned no id');
                assert.propertyVal(JSON.parse(body), 'error', 'host is not allowed');
                done();
            });
        }).timeout(10000);

        it('filename not found: should respond with an error 500', (done) => {
            let form = {
                zenodo_url: 'https://sandbox.zenodo.org/record/69114',
                filename: 'not_existing_file.xyz',
                content_type: 'compendium_v1',
            };

            let j = request.jar();
            let ck = request.cookie('connect.sid=' + cookie);
            j.setCookie(ck, host);

            request({
                uri: host + '/api/v2/compendium',
                method: 'POST',
                jar: j,
                form: form,
                timeout: requestLoadingTimeout
            }, (err, res, body) => {
                assert.ifError(err);
                assert.equal(res.statusCode, 500);
                assert.isUndefined(JSON.parse(body).id, 'returned no id');
                assert.propertyVal(JSON.parse(body), 'error', '{"error":"download failed: //sandbox.zenodo.org/record/69114/files/not_existing_file.xyz"}');
                done();
            });
        }).timeout(10000);
    });  
});

