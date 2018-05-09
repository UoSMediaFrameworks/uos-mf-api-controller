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
             *  ThemeId:
             *      type: object
             *      required:
             *          - theme
             *      properties:
             *          theme:
             *              type: string
             *
             *  PlayScenesAndThemes:
             *      type: object
             *      properties:
             *          scenes:
             *              type: array
             *              items:
             *                  type: string
             *          themes:
             *              type: array
             *              items:
             *                  type: string
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
             *                  type: string
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
             *              type: string
             *
             *  Password:
             *      type: object
             *      required:
             *          - password
             *      properties:
             *          password:
             *              type: string
             *
             *  Username:
             *      type: object
             *      required:
             *          - username
             *      properties:
             *          username:
             *              type: string
             *
             *  AuthCreds:
             *      type: object
             *      require:
             *          - username,
             *          - password
             *      properties:
             *          username:
             *              type: string
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
             *              type: string
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
             *  MediaCommand:
             *      type: object
             *      required:
             *          - media
             *          - roomId
             *      properties:
             *          roomId:
             *              type: string
             *          media:
             *              type: object
             *              $ref: '#/definitions/MediaAssetSchema'
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
             *            description: a username and password key
             *            required: true
             *            schema:
             *                $ref: '#/definitions/AuthCreds'
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
                const creds = {password: req.body.password,username:req.body.username};

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
                    scenes: [req.body.scenes],
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

                console.log("/playback/scene/theme/show'");
                console.log(req.body);

                self.commandAPIController.playSceneAndThemes(req.body.roomId, {
                    scenes: [req.body.sceneTheme.scene],
                    themes: [req.body.sceneTheme.theme]
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
                console.log("/playback/theme/show");
                console.log(req.body);

                self.commandAPIController.playSceneAndThemes(req.body.roomId, {
                    scenes: [],
                    themes: [req.body.theme]
                }, function () {
                    res.json({ack: true});
                });
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
            //TODO: AP implement in hub
            self.router.post('/playback/tag/matcher/set', function (req, res) {
                console.log(req.body)
                self.commandAPIController.sendCommand(req.body.roomId,"setTagMatcher", {
                        matcher:req.body.matcher
                }, function (res) {
                    res.json({ack: true});
                });
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

                const groupId = res.locals[self.API_GROUP_ID_KEY];

                console.log(`/scene/list - groupId: ${groupId} - lookingForGroup: ${self.API_GROUP_ID_KEY}`);

                self.dataController.listScenes(parseInt(groupId), function (err, scenes) {
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
                console.log({sceneId: req.get("sceneId"), token: req.get(self.API_KEY_HEADER)});
                request
                    .post({
                        url: process.env.ASSET_STORE + "/api/scene/full",
                        formData: {sceneId: req.get("sceneId"), token: req.get(self.API_KEY_HEADER)}
                    }, function (err, httpResponse, body) {
                        if (err) {
                            res.status(400).json({message: JSON.stringify(err)});
                        } else {
                            res.status(200).json(JSON.parse(body));
                        }
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
             *                $ref: '#/definitions/MediaCommand'
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
             *                $ref: '#/definitions/MediaCommand'
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
             *                $ref: '#/definitions/MediaCommand'
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


            // APEP host the playback API behind require pass key token security
            self.app.use(self.requireToken.bind(self), self.router);

            if (callback)
                callback();
        });
    }
    //TODO: We have talked about removing this.
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

        socket.on("/playback/media/show", function (roomId, mediaObject) {
            console.log("/playback/media/show ws made - mediaObject: ", mediaObject);
            self.commandAPIController.sendCommand(roomId, "event.playback.media.show", mediaObject);
        });
        socket.on("/playback/media/transition", function (roomId, mediaObject) {
            console.log("/playback/media/transitioning ws made - mediaObject: ", mediaObject);
            self.commandAPIController.sendCommand(roomId, "event.playback.media.transition", mediaObject);
        });
        socket.on("/playback/media/done", function (roomId, mediaObject) {
            console.log("/playback/media/done ws made - mediaObject: ", mediaObject);
            self.commandAPIController.sendCommand(roomId, "event.playback.media.done", mediaObject);
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

        socket.on("/scene/list", function (callback) {
            console.log(`/scene/list - groupId: ${socket.groupId}`);

            self.dataController.listScenes(parseInt(socket.groupId), function (err, scenes) {
                callback(err, scenes);
            });
        });
        socket.on("/scene/find/by/name", function (data, callback) {
        });
        socket.on("/scene/full", function (sceneId, callback) {
            request
                .post({
                    url: process.env.ASSET_STORE,
                    formData: {sceneId: sceneId, token: socket.token}
                }, function (err, httpResponse, body) {
                    if (err) {
                        callback({message: JSON.stringify(err)});
                    } else {
                        callback(null, JSON.parse(body));
                    }
                });
        });

        socket.on("/playback/iot/data", function (data, callback) {
        });
    }
}

module.exports = MediaframeApiController;