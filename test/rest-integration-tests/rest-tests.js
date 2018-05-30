'use strict';

const sinon = require('sinon');
const assert = require('assert');
const Swagger = require('swagger-client');
const _ = require('lodash');

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
                    let expectedCommandName = "sceneAudioScale"
                    assert.equal(secondArgument, expectedCommandName, "the command name was incorrect");

                    let thirdArgument  = stub.getCall(0).args[2];
                    assert(_.isEqual(thirdArgument, data), `the rescale param ${thirdArgument} was not correct as specified from the data ${data}`)

                    done();
                })
        });
    });

    describe('/playback/scene/config/apply', function () {
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

        function postApplyNamedSceneConfig(token, data) {
            return {
                url: '/playback/scene/config/apply',
                pathName: '/playback/scene/config/apply',
                method: "POST",
                parameters: {
                    applySceneConfig: data
                },
                requestInterceptor: function (req) {
                    req.headers["x-api-key"] = token;
                    return req;
                }
            };
        }

        it('passing on the correct command contents', function (done) {
            let stub = sandbox.stub(testApp.commandAPIController, "sendCommand"); // roomId, commandName, commandValue

            let token = this.token;

            // APEP for this test I've included everything currently in the schema
            let sceneConfigJson = {
                "name": "scene/config/examplesceneid/default-2",
                "overrides": {
                    timings: {
                        displayDuration: 5,
                        displayInterval: 5,
                        transitionDuration: 2,
                        sceneDuration: 44
                    },
                    constraints: {
                        maximumOnScreen: {
                            image: 3,
                            video: 1,
                            text: 1,
                            audio: 1
                        }
                    },
                    semantics: [
                        {
                            name: "Wood",
                            value: "trees, lumber"
                        }
                    ]
                },
                "config": {
                    backgroundPriority: {
                        visualLayer: 5
                    },
                    audioMix: {
                        groups: [
                            {
                                tagMatch: "trees, lumber",
                                rescaleFactor: 0.5
                            },
                            {
                                theme: "Wood",
                                rescaleFactor: 0.15
                            }
                        ]
                    },
                    tagFilter: {

                    },
                    themeFilter: {

                    },
                    transitionOptions: {

                    }
                }
            };

            this.client.execute(postApplyNamedSceneConfig(token, sceneConfigJson))
                .then(function (res) {
                    // Make sure the SendActions have been called to change the state to PLAYING
                    sinon.assert.calledOnce(testApp.commandAPIController.sendCommand);

                    // APEP make sure it was called with correct number of args
                    assert.equal(stub.getCall(0).args.length, 3);

                    let firstArgument  = stub.getCall(0).args[0];

                    let secondArgument = stub.getCall(0).args[1];
                    let expectedCommandName = "applySceneConfig";
                    assert.equal(secondArgument, expectedCommandName, "the command name was incorrect");

                    let thirdArgument  = stub.getCall(0).args[2];
                    assert(_.isEqual(thirdArgument, sceneConfigJson), ` ${thirdArgument} was not correct as specified  ${sceneConfigJson}`);

                    done();
                })
        })
    });

    describe('/playback/scene/config/apply/byname', function () {
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

        function postApplyNamedSceneConfig(token, data) {
            return {
                url: '/playback/scene/config/apply/byname',
                pathName: '/playback/scene/config/apply/byname',
                method: "POST",
                parameters: {
                    applyNamedSceneConfig: data
                },
                requestInterceptor: function (req) {
                    req.headers["x-api-key"] = token;
                    return req;
                }
            };
        }

        it('passing on the correct command contents', function (done) {
            let stub = sandbox.stub(testApp.commandAPIController, "sendCommand"); // roomId, commandName, commandValue

            let token = this.token;

            let applyNamedSceneConfig = {
                "sceneId": "fakeSceneId",
                "name": "scene/config/examplesceneid/default"
            };

            this.client.execute(postApplyNamedSceneConfig(token, applyNamedSceneConfig))
                .then(function (res) {
                    // Make sure the SendActions have been called to change the state to PLAYING
                    sinon.assert.calledOnce(testApp.commandAPIController.sendCommand);

                    // APEP make sure it was called with correct number of args
                    assert.equal(stub.getCall(0).args.length, 3);

                    let firstArgument  = stub.getCall(0).args[0];

                    let secondArgument = stub.getCall(0).args[1];
                    let expectedCommandName = "applyNamedSceneConfig"
                    assert.equal(secondArgument, expectedCommandName, "the command name was incorrect");

                    let thirdArgument  = stub.getCall(0).args[2];
                    assert(_.isEqual(thirdArgument, applyNamedSceneConfig), ` ${thirdArgument} was not correct as specified  ${applyNamedSceneConfig}`)

                    done();
                })
        })
    });

    describe('/playback/scene/visual-layer/update', function () {
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

        function postSceneVisualLayerChange(token, data) {
            return {
                url: '/playback/scene/visual-layer/update',
                pathName: '/playback/scene/visual-layer/update',
                method: "POST",
                parameters: {
                    visualLayerChangeForScene: data
                },
                requestInterceptor: function (req) {
                    req.headers["x-api-key"] = token;
                    return req;
                }
            };
        }

        it('sendCommand is called for the CommandAPIController', function (done) {
            // APEP visual layer might be non required - given a scene config
        });
    })
});