'use strict';

const sinon = require('sinon');
const assert = require('assert');
const Swagger = require('swagger-client');

const CommandAPIController = require("../../src/controllers/command-api-controller");

const testApp = require('../client-integration-tests/test-app');

const swaggerSpecUrl = 'http://localhost:3001/api-docs.json';
const websocketEndpoint = "http://localhost:3001";

const authOp = {
    pathName: '/auth/token/get',
    method: "POST",
    parameters: {
        creds: {
            password: process.env.HUB_PASSWORD
        }
    }
};

let sandbox;

describe('RestTests', function () {

    function setupTestWithLogin(self, done) {
        Swagger(swaggerSpecUrl)
            .then(function (authClient) {
                authClient.execute(authOp)
                    .then(function (res) {
                        let authResult = res.body;
                        assert(authResult.token);
                        assert(authResult.roomId);
                        assert(authResult.groupId === '0');
                        self.token = authResult.token;
                        self.roomId = authResult.roomId;
                        self.client = authClient;
                        done();
                    });
            });
    }

    // APEP we need to actually run a test environment version of the web server to these unit tests
    before(function(done) {
        testApp.init(done);
    });

    describe('/playback/scene/audio/scale', function () {

        before(function(done) {
            setupTestWithLogin(this, done);
            // APEP above methods adds this.token, this.roomId, this.client
        });

        beforeEach(function() {
            this.sinon = sandbox = sinon.sandbox.create();
        });

        afterEach(function() {
            sandbox.restore();
        });

        function getSceneAudioScaleOp(token, data) {
            return {
                url: '/playback/scene/audio/scale',
                pathName: '/playback/scene/audio/scale',
                method: "POST",
                parameters: {
                    rescaleAudioForScene: data
                },
                requestInterceptor: function (req) {
                    req.headers["x-api-key"] = token;
                    return req;
                }
            };
        }

        it('sendCommand is called for the CommandAPIController', function (done) {

            let stub = sandbox.stub(testApp.commandAPIController, "sendCommand"); // roomId, commandName, commandValue

            let token = this.token;

            let data = {
                "sceneId": "fakeSceneId",
                "rescaleFactor": 0.5
            };

            this.client.execute(getSceneAudioScaleOp(token, data))
                .then(function (res) {
                    // Make sure the SendActions have been called to change the state to PLAYING
                    sinon.assert.calledOnce(testApp.commandAPIController.sendCommand);

                    // APEP make sure it was called with correct number of args
                    assert.equal(stub.getCall(0).args.length, 3);

                    let firstArgument  = stub.getCall(0).args[0];
                    let expectedRoomId = "";
                    assert.equal(firstArgument, expectedRoomId, "the room id param was missed");

                    let secondArgument = stub.getCall(0).args[1];
                    assert.equal(secondArgument, data.sceneId, "the scene id param was not correct as specified from the data")

                    let thirdArgument  = stub.getCall(0).args[2];
                    assert.equal(thirdArgument, data.rescaleFactor, `the rescale param ${thirdArgument} was not correct as specified from the data ${data.rescaleFactor}`)

                    done();
                })
        });
    });
});