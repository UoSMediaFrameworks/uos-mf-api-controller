"use strict";

/**
 *
 (timer and iterator)
 /scene/list - receive the scene list
 /scene/full - receive the full scene with DB objects (this is not implemented in the API so I'll have to do that)
 /playback/media/show - tell clients to show a piece of media
 /playback/media/transitioning - tell the API to transition a piece of media
 /playback/media/done  - tell the API to finish a piece of media

 (Renderer optionally API posting for)
 /playback/media/transitioning - tell the API to transition a piece of media
 /playback/media/done  - tell the API to finish a piece of media

 (Renderer listing for)
 http://dev-uos-mf-api.eu-west-1.elasticbeanstalk.com/ws-docs/
 mediaframework.output.1.0.event.playback.media.show - Renderer must display this piece of media
 mediaframework.output.1.0.event.playback.media.transition - Rendere must transition this piece of media
 mediaframework.output.1.0.event.playback.media.done - Renderer must end this piece of media

 */

const assert = require('assert');
const testApp = require('./test-app');
const Swagger = require('swagger-client')

const authOp = {
    pathName: '/auth/token/get',
    method: "POST",
    parameters: {
        creds: {
            password: "kittens"
        }
    }
};

describe("UWP Client Testing", function() {
    before(function(done) {
        testApp.init(done);
    });

    describe("JSClient", function() {

       describe("Auth", function() {

            before(function(done) {
                var self = this;
                Swagger('http://localhost:3000/api-docs.json')
                    .then( function(client) {
                        self.client = client;
                        done();
                    });
            });

            it('"auth/token/get", <valid creds>', function(done) {
                this.client.execute(authOp)
                    .then(function(res){
                        var authResult = res.body;
                        assert(authResult.token);
                        assert(authResult.roomId);
                        assert(authResult.groupId === '0');
                        done();
                    });
            });
       });

       describe("ListingScenes", function() {
           before(function(done) {
               var self = this;
                Swagger('http://localhost:3000/api-docs.json')
                   .then( function(authClient) {
                       authClient.execute(authOp)
                           .then(function(res) {
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

           it('"/scene/list", returns a scene list', function(done) {
               var self = this;

               const sceneListOp = {
                   url: '/scene/list',
                   pathName: '/scene/list',
                   method: "GET",
                   requestInterceptor: function(req) {
                       req.headers["x-api-key"] = self.token;
                       return req;
                   }
               };

               this.client.execute(sceneListOp)
                   .then(function(res) {
                      done();
                   })
           });
       })
    });
});



// Swagger({
//     spec: authClient.spec,
//     requestInterceptor(req)  {
//         req.headers["x-api-key"] = self.token;
//         console.log("Swaggy proxy");
//         console.log(req.headers);
//         return this.http(req)  // Continue the request
//     }
// }).then( function(client) {
//         self.newClient = client;
//         console.log("HERE");
//         done();
//     });