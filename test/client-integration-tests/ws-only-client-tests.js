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
const SocketIOClient = require('socket.io-client');

const websocketEndpoint = "http://localhost:3000";

describe("Websockets Only Client Testing", function () {
    before(function (done) {
        testApp.init(done);
    });

    describe('WSAuth', function() {
       beforeEach(function(done) {
           this.timeout(4000);
           const validCreds = {password: process.env.HUB_PASSWORD};
           this.controllerClient = SocketIOClient(websocketEndpoint);
           var self = this;
           this.controllerClient.on('connect', function () {
               self.controllerClient.emit('auth', validCreds, function (err, token, roomId, groupId) {
                   assert(!err);
                   self.authToken = token;
                   self.roomId = roomId;
                   done();
               });
           });
       });

       afterEach(function(done) {
           this.controllerClient.disconnect();
           done();
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

       describe('/scene/full', function() {

           // APEP before trumps a beforeEach of the parent test suit.  Therefore I've had to use this
           beforeEach(function(done) {
               this.timeout(5000);
               var self = this;
               this.controllerClient.emit("/scene/list", function(err, sceneList) {
                   assert(!err);
                   assert(sceneList.length > 0);
                   self.sceneList = sceneList;
                   done();
               });
           });

           it('returns <scene>', function(done) {
               const sceneId = this.sceneList[0]._id;
               this.controllerClient.emit("/scene/full", sceneId, function(err, scene) {
                  assert(!err);
                  assert(scene);
                  assert(scene.hasOwnProperty("_id"));
                  done();
               });
           });
       });

       describe('register', function() {
          it('WS client can register to a room and receive updates', function(done) {
              this.timeout(6000);

              const mediaObject = {_id: "yacn"};

              this.controllerClient.on('event.playback.media.show', function (media) {
                  assert(media);
                  assert.deepEqual(media.value, mediaObject);
                  done();
              });

              this.controllerClient.emit('register', this.roomId);

              var self = this;

              // APEP give a little grace period for register
              setTimeout(function () {
                  testApp.commandAPIController.sendCommand(self.roomId, "event.playback.media.show", mediaObject);
              }, 500);
          });
       });

       describe('"/playback/media/<show, transition, done>"', function() {

           before(function() {
               this.mediaObject = {_id: "yacn"};
           });

           beforeEach(function() {
               this.controllerClient.emit('register', this.roomId);
           });

           it("show", function(done) {
               var self = this;

               this.controllerClient.on('event.playback.media.show', function (media) {
                   assert(media);
                   assert.deepEqual(media.value, self.mediaObject);
                   done();
               });

               this.controllerClient.emit('/playback/media/show', this.roomId, this.mediaObject);
           });

           it("transition", function(done) {
               var self = this;

               this.controllerClient.on('event.playback.media.transition', function (media) {
                   assert(media);
                   assert.deepEqual(media.value, self.mediaObject);
                   done();
               });

               this.controllerClient.emit('/playback/media/transition', this.roomId, this.mediaObject);
           });

           it("done", function(done) {
               var self = this;

               this.controllerClient.on('event.playback.media.done', function (media) {
                   assert(media);
                   assert.deepEqual(media.value, self.mediaObject);
                   done();
               });

               this.controllerClient.emit('/playback/media/done', this.roomId, this.mediaObject);
           });
       })
    });
});