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
 (done) /scene/list - receive the scene list
 /scene/full - receive the full scene with DB objects (this is not implemented in the API so I'll have to do that)
 /playback/media/show - tell clients to show a piece of media
 /playback/media/transitioning - tell the API to transition a piece of media
 /playback/media/done  - tell the API to finish a piece of media

 (Renderer optionally API posting for)
 /playback/media/transitioning - tell the API to transition a piece of media
 /playback/media/done  - tell the API to finish a piece of media

 (Renderer listing for)
 http://dev-uos-mf-api.eu-west-1.elasticbeanstalk.com/ws-docs/
 mediaframework.output.event.playback.media.show - Renderer must display this piece of media
 mediaframework.output.event.playback.media.transition - Renderer must transition this piece of media
 mediaframework.output.event.playback.media.done - Renderer must end this piece of media
 */


const assert = require('assert');
const testApp = require('./test-app');
const Swagger = require('swagger-client');
const SocketIOClient = require('socket.io-client');

const websocketEndpoint = "http://localhost:3000";

describe("Websockets Only Client Testing", function () {
    before(function (done) {
        testApp.init(done);
    });

    describe('WSAuth', function() {
       before(function(done) {
           const validCreds = {password: process.env.HUB_PASSWORD};
           this.controllerClient = SocketIOClient(websocketEndpoint);
           var self = this;
           this.controllerClient.on('connect', function () {
               self.controllerClient.emit('auth', validCreds, function (err, token, roomId, groupId) {
                   assert(!err);
                   // self.controllerClient.emit('register', roomId);
                   done();
               });
           });
       });

       describe('/scene/list', function() {

           it('returns <scene list>', function(done) {
              this.controllerClient.emit("/scene/list", function(err, sceneList) {
                  assert(!err);
                  assert(Array.isArray(sceneList));
                  var sceneListItem = sceneList[0];
                  assert(sceneListItem.hasOwnProperty("_id"));
                  assert(sceneListItem.hasOwnProperty("name"));
                  assert(sceneListItem.hasOwnProperty("_groupID"));
                  done();
              });
           });
       });
    });
});