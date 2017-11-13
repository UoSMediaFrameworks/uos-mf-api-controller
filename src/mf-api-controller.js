"use strict";

const MediaframeworkHubController = require("./mf-hub-controller");

const DataController = require("uos-legacy-hub-controller/src/modules/controllers/data-controller");
const CommandAPIController = require("./controllers/command-api-controller");
const SubscribeController = require("uos-legacy-hub-controller/src/modules/controllers/subscribe-controller");

const request = require("request");

class MediaframeApiController extends MediaframeworkHubController {

    constructor(config) {
        super(config);
    }

    init(callback) {
        const self = this;

        this.mediaHubConnection.tryConnect(function () {

            self.dataController = new DataController(self.mediaHubConnection.hub, self.io);
            self.commandAPIController = new CommandAPIController(self.mediaHubConnection.hub, self.io);
            self.subscribeController = new SubscribeController();

            // APEP define a public route for the API documentation
            self.app.get('/api-docs.json', function (req, res) {
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
             *  SceneName:
             *      type: object
             *      required:
             *          - sceneName
             *      properties:
             *          sceneName:
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
             *  PlayScenesAndThemes:
             *      type: object
             *      properties:
             *          scenes:
             *              type: array
             *              items:
             *                  $ref: '#/definitions/Scene'
             *          themes:
             *              type: array
             *              items:
             *                  $ref: '#/definitions/Theme'
             *
             *  Play:
             *      type: object
             *      required:
             *          - play
             *          - roomId
             *      properties:
             *          roomId:
             *              type: string
             *          play:
             *              type: object
             *              $ref: '#/definitions/PlayScenesAndThemes'
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
             *  PlayScene:
             *      type: object
             *      required:
             *          - roomId:
             *          - scene
             *      properties:
             *          roomId:
             *              type: string
             *              description: The playback room
             *          scene:
             *              type: object
             *              $ref: '#/definitions/Scene'
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
             *              $ref: '#/definitions/Media'
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
             *
             *  PlaySceneTheme:
             *      type: object
             *      properties:
             *          roomId:
             *              type: string
             *          sceneTheme:
             *              type: object
             *              $ref: '#/definitions/SceneTheme'
             *
             *  SceneTheme:
             *      type: object
             *      properties:
             *          scene:
             *              type: string
             *              description: String Scene Id
             *          theme:
             *              type: string
             *              description: String theme
             *
             *  SceneThemes:
             *      type: array
             *      items:
             *          $ref: '#/definitions/SceneTheme'
             *
             *  PlayTheme:
             *      type: object
             *      properties:
             *          roomId:
             *              type: string
             *          theme:
             *              type: object
             *              $ref: '#/definitions/Theme'
             *
             *  SetTagMatcher:
             *      type: string
             *      description: A valid tag matcher string, bool tag matching allowed
             *
             *  MediaSceneForListSchema:
             *      type: object
             *      required:
             *          - _id
             *          - name
             *          - _groupID
             *      properties:
             *          _id:
             *              type: string
             *          name:
             *              type: string
             *          _groupID:
             *              type: integer
             *
             *  SceneList:
             *      type: array
             *      items:
             *          $ref: '#/definitions/MediaSceneForListSchema'
             *
             *  MediaTransitioning:
             *      type: object
             *      $ref: '#/definitions/MediaAssetSchema'
             *
             *  MediaDone:
             *      type: object
             *      $ref: '#/definitions/MediaAssetSchema'
             *
             *  Data:
             *      type: object
             *
             *  ErrorMessage:
             *      type: object
             *      properties:
             *          message:
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
             *          400:
             *              description: An error from getting a token
             *              schema:
             *                  $ref: '#/definitions/ErrorMessage'
             */
            self.app.post('/auth/token/get', function (req, res) {
                const creds = {password: req.body.password};

                self.mediaHubConnection.attemptClientAuth(creds, function (err, token, roomId, groupId) {
                    if (err) {
                        res.status(400).send({message: err});
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
             *          400:
             *              description : An error
             */
            self.router.post('/playback/scenes/themes/show', function (req, res) {

                console.log("/playback/scenes/themes/show");
                console.log(req.body);

                self.commandAPIController.playSceneAndThemes(req.body.roomId, req.body.play, function (err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.json({ack: true});
                    }
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
            self.router.post('/playback/scenes/show', function (req, res) {

                console.log("/playback/scenes/show");
                console.log(req.body);

                self.commandAPIController.playSceneAndThemes(req.body.roomId, {
                    scenes: req.body.scenes,
                    themes: []
                }, function () {
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
            self.router.post('/playback/media/show', function (req, res) {
                console.log("/playback/media/show request made - body: ", req.body);
                self.commandAPIController.sendCommand(req.body.roomId, "event.playback.media.show", req.body.media);
                res.json({ack: true});
            });

            /**
             * @swagger
             * /playback/scenes/themes/permutations:
             *  get:
             *      description: Get a list of every unique permutations of SceneTheme from a bucket of Scenes and Themes
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
             *              description: List of SceneTheme Combinations
             *              schema:
             *                  $ref: '#/definitions/SceneThemes'
             */
            self.router.get('/playback/scenes/themes/permutations', function (req, res) {
            });

            /**
             * @swagger
             * /playback/scene/show:
             *  post:
             *      description: Show scene
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
             *                $ref: '#/definitions/PlayScene'
             *      security:
             *          - APIKeyHeader: []
             *      responses:
             *          200:
             *              description: Acknowledgement
             *              schema:
             *                  $ref: '#/definitions/ApiAck'
             */
            self.router.post('/playback/scene/show', function (req, res) {

                console.log("/playback/scene/show");
                console.log(req.body);

                self.commandAPIController.playSceneAndThemes(req.body.roomId, {
                    scenes: [req.body.play],
                    themes: []
                }, function () {
                    res.json({ack: true});
                });
            });

            /**
             * @swagger
             * /playback/scene/theme/show:
             *  post:
             *      description: Show scene theme
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
             *                $ref: '#/definitions/PlaySceneTheme'
             *      security:
             *          - APIKeyHeader: []
             *      responses:
             *          200:
             *              description: Acknowledgement
             *              schema:
             *                  $ref: '#/definitions/ApiAck'
             */
            self.router.post('/playback/scene/theme/show', function (req, res) {

                console.log("/playback/scene/show");
                console.log(req.body);

                self.commandAPIController.playSceneAndThemes(req.body.roomId, {
                    scenes: [req.body.play.scene],
                    themes: [req.body.play.theme]
                }, function () {
                    res.json({ack: true});
                });
            });

            /**
             * @swagger
             * /playback/theme/show:
             *  post:
             *      description: Show theme
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
             *                $ref: '#/definitions/PlayTheme'
             *      security:
             *          - APIKeyHeader: []
             *      responses:
             *          200:
             *              description: Acknowledgement
             *              schema:
             *                  $ref: '#/definitions/ApiAck'
             */
            self.router.post('/playback/theme/show', function (req, res) {
            });

            /**
             * @swagger
             * /playback/tag/matcher/set:
             *  post:
             *      description: Set a tag matcher
             *      consumes:
             *          - application/json
             *      produces:
             *          - application/json
             *      parameters:
             *          - in: body
             *            name: matcher
             *            description: A tag matcher update request
             *            required: true
             *            schema:
             *                $ref: '#/definitions/SetTagMatcher'
             *      security:
             *          - APIKeyHeader: []
             *      responses:
             *          200:
             *              description: Acknowledgement
             *              schema:
             *                  $ref: '#/definitions/ApiAck'
             */
            self.router.post('/playback/tag/matcher/set', function (req, res) {
            });

            /**
             * @swagger
             * /scene/list:
             *  get:
             *      description: Get a list of media scenes (_id, names and _groupID)
             *      consumes:
             *          - application/json
             *      produces:
             *          - application/json
             *      security:
             *          - APIKeyHeader: []
             *      responses:
             *          200:
             *              description: List of media scenes
             *              schema:
             *                  $ref: '#/definitions/SceneList'
             *          400:
             *              description: Database error
             */
            self.router.get('/scene/list', function (req, res) {

                const groupId = res.locals[API_GROUP_ID_KEY];

                console.log(`/scene/list - groupId: ${groupId}`);

                self.dataController.listScenes(groupId, function (err, scenes) {
                    if (err) {
                        return res.sendStatus(400);
                    } else {
                        return res.status(200).send(scenes);
                    }
                });
            });

            /**
             * @swagger
             * /scene/find/by/name:
             *  get:
             *      description: Get a media scene.
             *      consumes:
             *          - application/json
             *      produces:
             *          - application/json
             *      parameters:
             *          - in: header
             *            name: sceneName
             *            description: A scene name
             *            required: true
             *            schema:
             *                $ref: '#/definitions/SceneName'
             *      security:
             *          - APIKeyHeader: []
             *      responses:
             *          200:
             *              description: A media scene
             *              schema:
             *                  $ref: '#/definitions/MediaSceneSchema'
             *          400:
             *              description: Database error
             */
            self.router.get('/scene/find/by/name', function (req, res) {

                const sceneName = req.get("sceneName");

                console.log(`scene/find/by/name  - sceneName: ${sceneName}`);

                self.dataController.loadSceneByName(sceneName, function (err, scene) {
                    if (err) {
                        return res.status(400);
                    } else {
                        return res.status(200).send(scene);
                    }
                });
            });

            /**
             * @swagger
             * /scene/full:
             *  get:
             *      description: Get a media scene with any uploaded media object full database details appended.
             *      consumes:
             *          - application/json
             *      produces:
             *          - application/json
             *      parameters:
             *          - in: header
             *            name: sceneId
             *            description: A scene id
             *            required: true
             *            schema:
             *                $ref: '#/definitions/SceneId'
             *      security:
             *          - APIKeyHeader: []
             *      responses:
             *          200:
             *              description: A media scene with any uploaded media objects appended in full
             *              schema:
             *                  $ref: '#/definitions/MediaSceneSchema'
             *          400:
             *              description: Database error
             */
            self.router.get('/scene/full', function (req, res) {
                console.log({sceneId: req.get("sceneId"), token: req.get(API_KEY_HEADER)});
                request
                    .post({
                        url: process.env.ASSET_STORE,
                        formData: {sceneId: req.get("sceneId"), token: req.get(API_KEY_HEADER)}
                    }, function (err, httpResponse, body) {
                        if (err) {
                            return res.status(400).json({message: JSON.stringify(err)});
                        }

                        res.status(200).json(body);
                    });
            });

            /**
             * @swagger
             * /playback/media/transitioning:
             *  post:
             *      description: When a client begins transitioning a piece of media
             *      consumes:
             *          - application/json
             *      produces:
             *          - application/json
             *      parameters:
             *          - in: body
             *            name: transitioning
             *            description: the media object being transitioned by a client
             *            required: true
             *            schema:
             *                $ref: '#/definitions/MediaTransitioning'
             *      security:
             *          - APIKeyHeader: []
             *      responses:
             *          200:
             *              description: Acknowledgement
             *              schema:
             *                  $ref: '#/definitions/ApiAck'
             */
            self.router.post('/playback/media/transitioning', function (req, res) {
                console.log("/playback/media/transitioning request made - body: ", req.body);
                self.commandAPIController.sendCommand(req.body.roomId, "event.playback.media.transition", req.body.media);
                res.json({ack: true});
            });

            /**
             * @swagger
             * /playback/media/done:
             *  post:
             *      description: When a client begins transitioning a piece of media
             *      consumes:
             *          - application/json
             *      produces:
             *          - application/json
             *      parameters:
             *          - in: body
             *            name: finished
             *            description: the media object finished by a client
             *            required: true
             *            schema:
             *                $ref: '#/definitions/MediaDone'
             *      security:
             *          - APIKeyHeader: []
             *      responses:
             *          200:
             *              description: Acknowledgement
             *              schema:
             *                  $ref: '#/definitions/ApiAck'
             */
            self.router.post('/playback/media/done', function (req, res) {
                console.log("/playback/media/done request made - body: ", req.body);
                self.commandAPIController.sendCommand(req.body.roomId, "event.playback.media.done", req.body.media);
                res.json({ack: true});
            });

            /**
             * @swagger
             * /playback/iot/data:
             *  post:
             *      description: When a client begins transitioning a piece of media
             *      consumes:
             *          - application/json
             *      produces:
             *          - application/json
             *      parameters:
             *          - in: body
             *            name: data
             *            description: a schemaless data object from an IoT device
             *            required: true
             *            schema:
             *                $ref: '#/definitions/Data'
             *      security:
             *          - APIKeyHeader: []
             *      responses:
             *          200:
             *              description: Acknowledgement
             *              schema:
             *                  $ref: '#/definitions/ApiAck'
             */
            self.router.post('/playback/iot/data', function (req, res) {
                res.json({ack: true});
            });

            const API_KEY_HEADER = "X-API-Key";
            const API_GROUP_ID_KEY = "X-API-GroupID";

            function requireToken(req, res, next) {

                console.log("requireToken - check");

                if (req.method === "OPTIONS") {
                    return next();
                }

                const token = req.get(API_KEY_HEADER);

                if (!token) {
                    console.log("requireToken - check missing token in request header");
                    // APEP TODO send error message
                    return res.status(401).send({message: "check missing token in request header"});
                }

                // APEP we have a token, we need to check with the media hub if this is cool
                const creds = {token: token};

                self.mediaHubConnection.attemptClientAuth(creds, function (err, token, roomId, groupId) {
                    if (err) {
                        console.log(`requireToken - check error: ${err}`);
                        return res.status(401).send({message: "error checking with auth provider"});
                    } else {
                        console.log(`requireToken - check successful - groupId: ${groupId}`);

                        // APEP using response.locals, we can pass data between this middleware function and the request handler.
                        res.locals[API_GROUP_ID_KEY] = groupId;

                        next();
                    }
                });
            }

            // APEP host the playback API behind require pass key token security
            self.app.use(requireToken, self.router);

            if (callback)
                callback();
        });
    }

    clientSocketSuccessfulAuth(socket) {
        var self = this;

        socket.on("register", function (roomId) {
            self.subscribeController.register(socket, roomId);
        });

        // APEP TODO implement socket version of REST api
        socket.on("/playback/scenes/themes/show", function (data, callback) {
        });
        socket.on("/playback/scenes/show", function (data, callback) {
        });
        socket.on("/playback/media/show", function (data, callback) {
        });

        socket.on("/playback/scenes/themes/permutations", function (data, callback) {
        });
        socket.on("/playback/scene/show", function (data, callback) {
        });
        socket.on("/playback/scene/theme/show", function (data, callback) {
        });
        socket.on("/playback/theme/show", function (data, callback) {
        });
        socket.on("/playback/tag/matcher/set", function (data, callback) {
        });

        socket.on("/scene/list", function (data, callback) {
        });
        socket.on("/scene/find/by/name", function (data, callback) {
        });
        socket.on("/scene/full", function (data, callback) {
        });

        socket.on("/playback/media/transitioning", function (data, callback) {
        });
        socket.on("/playback/media/done", function (data, callback) {
        });
        socket.on("/playback/iot/data", function (data, callback) {
        });
    }
}

module.exports = MediaframeApiController;