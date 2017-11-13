"use strict";

/**
 *
 (commanding a timer and iterator)
 /playback/scenes/themes/show - Show every scene theme combination
 /playback/scenes/show - Show scene after scene
 /playback/scene/show - Show scene
 /playback/scene/theme/show - Show specific theme from scene
 /playback/theme/show - Filtering playback via theme
 /playback/tag/matcher/set - Filtering playback via Tag matching

 (timer and iterator)
 /scene/find/by/name - receive scene by name
 (done) /scene/list - receive the scene list
 (done) /scene/full - receive the full scene with DB objects (this is not implemented in the API so I'll have to do that)
 (done) /playback/media/show - tell clients to show a piece of media
 (done) /playback/media/transitioning - tell the API to transition a piece of media
 (done) /playback/media/done  - tell the API to finish a piece of media

 (Renderer optionally API posting for)
 /playback/media/transitioning - tell the API to transition a piece of media
 /playback/media/done  - tell the API to finish a piece of media

 (Renderer listing for)
 http://dev-uos-mf-api.eu-west-1.elasticbeanstalk.com/ws-docs/
 (done) mediaframework.output.event.playback.media.show - Renderer must display this piece of media
 (done) mediaframework.output.event.playback.media.transition - Renderer must transition this piece of media
 (done) mediaframework.output.event.playback.media.done - Renderer must end this piece of media
 */

const assert = require('assert');
const testApp = require('./test-app');
const Swagger = require('swagger-client');
const SocketIOClient = require('socket.io-client');

const authOp = {
    pathName: '/auth/token/get',
    method: "POST",
    parameters: {
        creds: {
            password: process.env.HUB_PASSWORD
        }
    }
};

const swaggerSpecUrl = 'http://localhost:3000/api-docs.json';
// const swaggerSpecUrl = 'http://dev-uos-mf-api.eu-west-1.elasticbeanstalk.com/api-docs.json';
const websocketEndpoint = "http://localhost:3000";
// const websocketEndpoint = "http://dev-uos-mf-api.eu-west-1.elasticbeanstalk.com";

describe("UWP Client Testing", function () {
    before(function (done) {
        testApp.init(done);
    });

    describe("JSClient", function () {

        function setupTestWithLogin(self, done) {
            Swagger(swaggerSpecUrl)
                .then(function (authClient) {
                    authClient.execute(authOp)
                        .then(function (res) {
                            var authResult = res.body;
                            assert(authResult.token);
                            assert(authResult.roomId);
                            assert(authResult.groupId === '0');
                            self.token = authResult.token;
                            self.client = authClient;
                            done();
                        });
                });
        }

        describe("Auth", function () {

            before(function (done) {
                var self = this;
                Swagger(swaggerSpecUrl)
                    .then(function (client) {
                        // console.log(client);
                        self.client = client;
                        done();
                    });
            });

            it('"auth/token/get", <valid creds>', function (done) {

                this
                    .client
                    .apis
                    .default
                    .post_auth_token_get({creds: {password: process.env.HUB_PASSWORD}})
                    .then(function (res) {
                        var authResult = res.body || res.obj; //Either seem to be fine
                        assert(authResult.token);
                        assert(authResult.roomId);
                        assert(authResult.groupId === '0');
                        done();
                    })
            });
        });

        function getSceneListOp(token) {
            return {
                url: '/scene/list',
                pathName: '/scene/list',
                method: "GET",
                requestInterceptor: function (req) {
                    req.headers["x-api-key"] = token;
                    return req;
                }
            };
        }

        describe("/scene/list", function () {
            before(function (done) {
                setupTestWithLogin(this, done);
            });

            it('"/scene/list", returns <scene list>', function (done) {
                const sceneListOp = getSceneListOp(this.token);

                this.client.execute(sceneListOp)
                    .then(function (res) {
                        const sceneList = res.body;
                        assert(Array.isArray(sceneList));
                        assert(sceneList[0].hasOwnProperty("_id"));
                        assert(sceneList[0].hasOwnProperty("_groupID"));
                        done();
                    });
            });
        });

        describe("/scene/full", function () {
            before(function (done) {
                var self = this;
                setupTestWithLogin(this, function () {
                    const sceneListOp = getSceneListOp(self.token);

                    // APEP find a valid scene from the scene list
                    self.client.execute(sceneListOp)
                        .then(function (res) {
                            const sceneList = res.body;
                            assert(Array.isArray(sceneList));
                            assert(sceneList[0].hasOwnProperty("_id"));
                            assert(sceneList[0].hasOwnProperty("_groupID"));
                            self.sceneList = sceneList;
                            done();
                        });
                });
            });

            it('"/scene/full", returns <full scene>', function (done) {
                this.timeout = 4000;
                var self = this;
                const sceneFullOp = {
                    url: '/scene/full',
                    pathName: '/scene/full',
                    method: "GET",
                    parameters: {
                        sceneId: self.sceneList[0]._id
                    },
                    requestInterceptor: function (req) {
                        req.headers["x-api-key"] = self.token;
                        return req;
                    }
                };

                this.client.execute(sceneFullOp)
                    .then(function (res) {
                        const fullScene = JSON.parse(res.body);
                        assert(fullScene);
                        assert(fullScene._id === self.sceneList[0]._id);
                        done();
                    });
            });
        });

        describe("WS Connection", function () {
            before(function (done) {
                var self = this;
                Swagger(swaggerSpecUrl)
                    .then(function (authClient) {
                        authClient.execute(authOp)
                            .then(function (res) {
                                var authResult = res.body;
                                assert(authResult.token);
                                assert(authResult.roomId);
                                assert(authResult.groupId === '0');
                                self.token = authResult.token;
                                self.client = authClient;
                                done();
                            });
                    });
            });

            it('WS client can connect and use token to be authenticated as valid ws', function (done) {
                this.timeout(12000);
                const validCreds = {token: this.token};

                const controllerClient = SocketIOClient(websocketEndpoint);

                controllerClient.on('connect', function () {
                    controllerClient.emit('auth', validCreds, function (err, token, roomId, groupId) {
                        assert(!err);

                        setTimeout(function () {
                            done();
                        }, 11000);
                    });
                });

                // APEP if we get disconnected, this test should fail.
                controllerClient.on('disconnect', function () {
                    assert(false);
                })
            });

            it('WS client can register to a room and receive updates', function (done) {
                const validCreds = {token: this.token};
                const mediaObject = {_id: "yacn"};
                const controllerClient = SocketIOClient(websocketEndpoint);

                controllerClient.on('connect', function () {

                    controllerClient.on('event.playback.media.show', function (media) {
                        assert(media);
                        assert.deepEqual(media.value, mediaObject);
                        done();
                    });

                    controllerClient.emit('auth', validCreds, function (err, token, roomId, groupId) {
                        assert(!err);

                        controllerClient.emit('register', roomId);

                        // APEP give a little grace period for register
                        setTimeout(function () {
                            testApp.commandAPIController.sendCommand(roomId, "event.playback.media.show", mediaObject);
                        }, 500);
                    });
                });
            });
        });

        function setupTestWithLoginAndWebsocketClientConnection(self, done) {
            Swagger(swaggerSpecUrl)
                .then(function (authClient) {
                    authClient.execute(authOp)
                        .then(function (res) {
                            var authResult = res.body;
                            assert(authResult.token);
                            assert(authResult.roomId);
                            assert(authResult.groupId === '0');

                            self.roomId = authResult.roomId;
                            self.token = authResult.token;
                            self.client = authClient;

                            const validCreds = {token: self.token};

                            self.controllerClient = SocketIOClient(websocketEndpoint);
                            self.controllerClient.on('connect', function () {
                                self.controllerClient.emit('auth', validCreds, function (err, token, roomId, groupId) {
                                    assert(!err);
                                    self.controllerClient.emit('register', self.roomId);
                                    done();
                                });
                            });
                        });
                });
        }

        describe("/playback/media/transitioning", function () {
            before(function (done) {
                this.timeout(3000);

                setupTestWithLoginAndWebsocketClientConnection(this, done);
            });

            it('"/playback/media/transitioning", {media: <valid piece of media> we get an ack', function (done) {
                const mediaObject = {_id: "mediaId"};

                var self = this;

                const mediaTransitionOp = {
                    url: '/playback/media/transitioning',
                    pathName: '/playback/media/transitioning',
                    method: "POST",
                    parameters: {
                        transitioning: {
                            roomId: self.roomId,
                            media: mediaObject
                        }
                    },
                    requestInterceptor: function (req) {
                        req.headers["x-api-key"] = self.token;
                        return req;
                    }
                };

                this.client.execute(mediaTransitionOp)
                    .then(function (res) {
                        const ack = res.body;
                        assert(ack);
                        done();
                    });
            });

            it('"/playback/media/transitioning", {media: <valid piece of media> sends this to the web sockets', function (done) {
                const mediaObject = {_id: "mediaId"};

                this.controllerClient.on('event.playback.media.transition', function (media) {
                    assert(media);
                    assert.deepEqual(media.value, mediaObject);
                    done();
                });


                var self = this;

                const mediaTransitionOp = {
                    url: '/playback/media/transitioning',
                    pathName: '/playback/media/transitioning',
                    method: "POST",
                    parameters: {
                        transitioning: {
                            roomId: self.roomId,
                            media: mediaObject
                        }
                    },
                    requestInterceptor: function (req) {
                        req.headers["x-api-key"] = self.token;
                        return req;
                    }
                };

                this.client.execute(mediaTransitionOp);
            });
        });

        describe("/playback/media/done", function () {
            before(function (done) {
                this.timeout(3000);

                setupTestWithLoginAndWebsocketClientConnection(this, done);
            });


            it('"/playback/media/done", {media: <valid piece of media> we get an ack', function (done) {
                const mediaObject = {_id: "mediaId"};

                var self = this;

                const mediaDoneOp = {
                    url: '/playback/media/done',
                    pathName: '/playback/media/done',
                    method: "POST",
                    parameters: {
                        finished: {
                            roomId: self.roomId,
                            media: mediaObject
                        }
                    },
                    requestInterceptor: function (req) {
                        req.headers["x-api-key"] = self.token;
                        return req;
                    }
                };

                this.client.execute(mediaDoneOp)
                    .then(function (res) {
                        const ack = res.body;
                        assert(ack);
                        done();
                    });
            });

            it('"/playback/media/done", {media: <valid piece of media> sends this to the web sockets', function (done) {
                const mediaObject = {_id: "mediaId"};

                this.controllerClient.on('event.playback.media.done', function (media) {
                    assert(media);
                    assert.deepEqual(media.value, mediaObject);
                    done();
                });


                var self = this;

                const mediaDoneOp = {
                    url: '/playback/media/done',
                    pathName: '/playback/media/done',
                    method: "POST",
                    parameters: {
                        finished: {
                            roomId: self.roomId,
                            media: mediaObject
                        }
                    },
                    requestInterceptor: function (req) {
                        req.headers["x-api-key"] = self.token;
                        return req;
                    }
                };

                this.client.execute(mediaDoneOp);
            });
        });

        describe("/playback/media/show", function () {
            before(function (done) {
                this.timeout(3000);

                setupTestWithLoginAndWebsocketClientConnection(this, done);
            });

            it('"/playback/media/show", {media: <valid piece of media> we get an ack', function (done) {
                const mediaObject = {_id: "mediaId"};

                var self = this;

                const mediaShowOp = {
                    url: '/playback/media/show',
                    pathName: '/playback/media/show',
                    method: "POST",
                    parameters: {
                        play: {
                            roomId: self.roomId,
                            media: mediaObject
                        }
                    },
                    requestInterceptor: function (req) {
                        req.headers["x-api-key"] = self.token;
                        return req;
                    }
                };

                this.client.execute(mediaShowOp)
                    .then(function (res) {
                        const ack = res.body;
                        assert(ack);
                        done();
                    });
            });

            it('"/playback/media/show", {media: <valid piece of media> sends this to the web sockets', function (done) {
                const mediaObject = {_id: "mediaId"};

                this.controllerClient.on('event.playback.media.show', function (media) {
                    assert(media);
                    assert.deepEqual(media.value, mediaObject);
                    done();
                });


                var self = this;

                const mediaShowOp = {
                    url: '/playback/media/show',
                    pathName: '/playback/media/show',
                    method: "POST",
                    parameters: {
                        play: {
                            roomId: self.roomId,
                            media: mediaObject
                        }
                    },
                    requestInterceptor: function (req) {
                        req.headers["x-api-key"] = self.token;
                        return req;
                    }
                };

                this.client.execute(mediaShowOp);
            });
        });

    });
});
