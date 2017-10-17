"use strict";

const MediaframeworkHubController = require("./mf-hub-controller");

const DataController = require("uos-legacy-hub-controller/src/modules/controllers/data-controller");
const CommandAPIController = require("uos-legacy-hub-controller/src/modules/controllers/command-api-controller");

class MediaframeApiController extends MediaframeworkHubController {

    constructor(config) {
        super(config);
    }

    init(callback) {
        var self = this;
        this.mediaHubConnection.tryConnect(function() {

            self.dataController = new DataController(self.mediaHubConnection.hub, self.io);
            self.commandAPIController = new CommandAPIController(self.mediaHubConnection.hub, self.io);

            self.app.get('/api-docs.json', function(req, res) {
                res.json(self.config.swaggerSpec);
            });

            /**
             * @swagger
             * securityDefinitions:
             *     APIKeyHeader:
             *         type: apiKey
             *         in: header
             *         name: X-API-Key
             * definitions:
             *  ApiAck:
             *      type: object
             *      required:
             *          - ack
             *      properties:
             *          ack:
             *              type: string
             *
             *  Media:
             *      type: object
             *      required:
             *          - _id
             *          - tags
             *          - type
             *      properties:
             *          _id:
             *              type: string
             *          tags:
             *              type: string
             *          text:
             *              type: string
             *          url:
             *              type: string
             *          type:
             *              type: string
             *
             *  SceneId:
             *      type: object
             *      required:
             *          - sceneId
             *      properties:
             *          sceneId:
             *              type: string
             *
             *  Scene:
             *      type: string
             *
             *  ThemeId:
             *      type: object
             *      required:
             *          - theme
             *      properties:
             *          theme:
             *              type: string
             *
             *  Theme:
             *      type: string
             *
             *  Play:
             *      type: object
             *      required:
             *          - scenes
             *          - themes
             *          - roomId
             *      properties:
             *          roomId:
             *              type: string
             *          scenes:
             *              type: array
             *              items:
             *                  $ref: '#/definitions/Scene'
             *          themes:
             *              type: array
             *              items:
             *                  $ref: '#/definitions/Theme'
             *
             *  PlayScenes:
             *      type: object
             *      required:
             *          - media
             *          - roomId
             *      properties:
             *          roomId:
             *              type: string
             *          scenes:
             *              type: array
             *              items:
             *                  $ref: '#/definitions/Scene'
             *
             *  PlayMedia:
             *      type: object
             *      required:
             *          - media
             *          - roomId
             *      properties:
             *          roomId:
             *              type: string
             *          media:
             *              type: object
             *              schema:
             *                  $ref: '#/definitions/Media'
             *
             *  Password:
             *      type: object
             *      required:
             *          - password
             *      properties:
             *          password:
             *              type: string
             *
             *  SessionResult:
             *      type: object
             *      properties:
             *          token:
             *              type: string
             *          roomId:
             *              type: string
             *          groupId:
             *              type: string
             */


            /**
             * @swagger
             * /auth/token/get:
             *  post:
             *      description: As a client, get a valid session token for the API
             *      consumes:
             *          - application/json
             *      produces:
             *          - application/json
             *      parameters:
             *          - in: body
             *            name: creds
             *            description: A password key
             *            required: true
             *            schema:
             *                $ref: '#/definitions/Password'
             *      responses:
             *          200:
             *              description: Valid session token given
             *              schema:
             *                  $ref: '#/definitions/SessionResult'
             */
            self.app.post('/auth/token/get', function(req, res) {
                const creds = {password: req.body.password};
                self.mediaHubConnection.hub.emit("authProvider", creds, function(err, token, roomId, groupId) {
                    if(err) {
                        res.sendStatus(400);
                    } else {
                        res.json({token: token, roomId: roomId, groupId: groupId});
                    }
                });
            });


            /**
             * @swagger
             * /playback/scenes/themes/show:
             *  post:
             *      description: Playback scene and theme combinations from the provided scenes and themes
             *      consumes:
             *          - application/json
             *      produces:
             *          - application/json
             *      parameters:
             *          - in: body
             *            name: play
             *            description: A play request
             *            required: true
             *            schema:
             *                $ref: '#/definitions/Play'
             *      security:
             *          - APIKeyHeader: []
             *      responses:
             *          200:
             *              description: Acknowledgement
             *              schema:
             *                  $ref: '#/definitions/ApiAck'
             */
            self.router.post('/scenes/themes/show', function(req, res){

                console.log("/playback/scenes/themes/show");
                console.log(req.body);

                self.commandAPIController.playSceneAndThemes(req.body.roomId, req.body, function(){
                    res.json({ack: true});
                });
            });

            /**
             * @swagger
             * /playback/scenes/show:
             *  post:
             *      description: Show scenes
             *      consumes:
             *          - application/json
             *      produces:
             *          - application/json
             *      parameters:
             *          - in: body
             *            name: play
             *            description: A play request
             *            required: true
             *            schema:
             *                $ref: '#/definitions/PlayScenes'
             *      security:
             *          - APIKeyHeader: []
             *      responses:
             *          200:
             *              description: Acknowledgement
             *              schema:
             *                  $ref: '#/definitions/ApiAck'
             */
            self.router.post('/scenes/show', function(req, res) {

                console.log("/playback/scenes/show");
                console.log(req.body);

                self.commandAPIController.playSceneAndThemes(req.body.roomId, {scenes: req.body.scenes, themes: []}, function() {
                    res.json({ack: true});
                });
            });

            /**
             * @swagger
             * /playback/media/show:
             *  post:
             *      description: Playback media
             *      consumes:
             *          - application/json
             *      produces:
             *          - application/json
             *      parameters:
             *          - in: body
             *            name: play
             *            description: A play request
             *            required: true
             *            schema:
             *                $ref: '#/definitions/PlayMedia'
             *      security:
             *          - APIKeyHeader: []
             *      responses:
             *          200:
             *              description: Acknowledgement
             *              schema:
             *                  $ref: '#/definitions/ApiAck'
             */
            self.router.post('/media/show', function(req, res) {

                console.log("/playback/media/show");
                console.log(req.body);

                self.commandAPIController.sendCommand(req.body.roomId, "event.playback.media.show", req.body.play);
                res.json({ack: true});
            });

            function requireToken(req, res, next) {

                console.log("requireToken - check");

                if (req.method === "OPTIONS") {
                    return next();
                }

                const token = req.get("X-API-Key");

                if(!token) {
                    console.log("requireToken - check missing token in request header");
                    return res.sendStatus(401);
                }

                // APEP we have a token, we need to check with the media hub if this is cool
                const creds = {token: token};

                self.mediaHubConnection.hub.emit("authProvider", creds, function(err, token, roomId, groupId) {
                    if(err) {
                        console.log(`requireToken - check error: ${err}`);
                        res.sendStatus(401);
                    } else {
                        console.log("requireToken - check successful");
                        next();
                    }
                });
            }

            self.app.use("/playback", requireToken, self.router);

            if(callback)
                callback();
        });
    }

    clientSocketSuccessfulAuth(socket) {
        var self = this;

        // APEP TODO attach socket listeners
    }
}

module.exports = MediaframeApiController;