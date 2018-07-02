"use strict";

const MediaframeworkHubController = require("./mf-hub-controller");

const DataController = require("uos-legacy-hub-controller/src/modules/controllers/data-controller");
const CommandAPIController = require("./controllers/command-api-controller");
const SubscribeController = require("uos-legacy-hub-controller/src/modules/controllers/subscribe-controller");

const request = require("request");
const _ = require("lodash");
const express = require('express');
const RateLimit = require('express-rate-limit');
const AWS = require('aws-sdk');


class MediaframeApiController extends MediaframeworkHubController {

    constructor(config) {
        super(config);

        this.HTML_RANDOM_CONTROLLER_RESET_PARAMS = {
            EnvironmentId: config.htmlControllerEnvironmentId,
            EnvironmentName: config.htmlControllerEnvironmentName
        };

        this.dataController = null;
        this.commandAPIController = null;
        this.subscribeController = null;
    }

    playbackRoutes() {

        let self = this;
        let router = express.Router();

        self.app.use(self.requireToken.bind(self), router);

        /**
         * @swagger
         * /playback/scene/audio/scale:
         *  post:
         *      description: Rescale all audio within a scene at runtime
         *      consumes:
         *          - application/json
         *      produces:
         *          - application/json
         *      parameters:
         *          - in: body
         *            name: body
         *            description: Details required for rescaling, the scene id and rescale factor between 0 and 1
         *            required: true
         *            schema:
         *                $ref: '#/definitions/SceneAudioRescale'
         *      security:
         *          - APIKeyHeader: []
         *      responses:
         *          200:
         *              description: Acknowledgement
         *              schema:
         *                  $ref: '#/definitions/ApiAck'
         *          400:
         *              description : An error
         *          429:
         *              description : Rate limited end point rejecting post - resend value after cool down
         */
        router.post('/scene/audio/scale', function (req, res) {
            console.log("/playback/scene/audio/scale");
            console.log(req.body);

            let roomId = "";

            self.commandAPIController.sendCommand(roomId, CommandAPIController.getCommandKeys().PLAYBACK_SCENE_AUDIO_SCALE, req.body);

            res.json({ack: true});
        });

        /**
         * @swagger
         * /playback/scene/list/audio/scale:
         *  post:
         *      description: Rescale all audio for each scene at runtime
         *      consumes:
         *          - application/json
         *      produces:
         *          - application/json
         *      parameters:
         *          - in: body
         *            name: body
         *            description: Details required for rescaling, the scene id and rescale factor between 0 and 1
         *            required: true
         *            schema:
         *                $ref: '#/definitions/SceneListAudioRescale'
         *      security:
         *          - APIKeyHeader: []
         *      responses:
         *          200:
         *              description: Acknowledgement
         *              schema:
         *                  $ref: '#/definitions/ApiAck'
         *          400:
         *              description : An error
         *          429:
         *              description : Rate limited end point rejecting post - resend value after cool down
         */
        router.post('/scene/list/audio/scale', function (req, res) {
            console.log("/playback/scene/list/audio/scale");
            console.log(req.body);

            let roomId = "";

            self.commandAPIController.sendCommand(roomId, CommandAPIController.getCommandKeys().PLAYBACK_SCENE_AUDIO_SCALE_LIST, req.body);

            res.json({ack: true});
        });

        /**
         * @swagger
         * /playback/scene/audio/step/up:
         *  post:
         *      description: Step all audio within a scene at runtime
         *      consumes:
         *          - application/json
         *      produces:
         *          - application/json
         *      parameters:
         *          - in: body
         *            name: stepAudioForScene
         *            description: Details required for stepping audio in a scene and stepping through the rescaling
         *            required: true
         *            schema:
         *                $ref: '#/definitions/SceneAudioStep'
         *      security:
         *          - APIKeyHeader: []
         *      responses:
         *          200:
         *              description: Acknowledgement
         *              schema:
         *                  $ref: '#/definitions/ApiAck'
         *          400:
         *              description : An error
         *          429:
         *              description : Rate limited end point rejecting post - resend value after cool down
         */
        router.post('/scene/audio/step/up', function (req, res) {
            console.log("/playback/scene/audio/step/up");

            let roomId = "";
            let audioStepUpPayload = req.body;
            audioStepUpPayload["step"] = 1;

            console.log(audioStepUpPayload);

            self.commandAPIController.sendCommand(roomId, CommandAPIController.getCommandKeys().PLAYBACK_SCENE_AUDIO_STEP, req.body);

            res.json({ack: true});
        });

        /**
         * @swagger
         * /playback/scene/audio/step/down:
         *  post:
         *      description: Step all audio within a scene at runtime
         *      consumes:
         *          - application/json
         *      produces:
         *          - application/json
         *      parameters:
         *          - in: body
         *            name: stepAudioForScene
         *            description: Details required for stepping audio in a scene and stepping through the rescaling
         *            required: true
         *            schema:
         *                $ref: '#/definitions/SceneAudioStep'
         *      security:
         *          - APIKeyHeader: []
         *      responses:
         *          200:
         *              description: Acknowledgement
         *              schema:
         *                  $ref: '#/definitions/ApiAck'
         *          400:
         *              description : An error
         *          429:
         *              description : Rate limited end point rejecting post - resend value after cool down
         */
        router.post('/scene/audio/step/down', function (req, res) {
            console.log("/playback/scene/audio/down");
            console.log(req.body);

            let roomId = "";
            let audioStepUpPayload = req.body;
            audioStepUpPayload["step"] = -1;

            console.log(audioStepUpPayload);

            self.commandAPIController.sendCommand(roomId, CommandAPIController.getCommandKeys().PLAYBACK_SCENE_AUDIO_STEP, req.body);

            res.json({ack: true});
        });

        /**
         * @swagger
         * /playback/scene/visual-layer/update:
         *  post:
         *      description: Updates the visual layer for all render able media within a scene at runtime
         *      consumes:
         *          - application/json
         *      produces:
         *          - application/json
         *      parameters:
         *          - in: body
         *            name: visualLayerChangeForScene
         *            description: Details required for changing the visual layer, the scene id and (int) layer.  0 is the lowest layer and it is suggested a min value of 1.
         *            required: true
         *            schema:
         *                $ref: '#/definitions/SceneVisualLayerChange'
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
        router.post('/scene/visual-layer/update', function (req, res) {
            console.log("/playback/scene/visual-layer/update");
            console.log(req.body);

            let roomId = "";

            // self.commandAPIController.sendCommand(roomId, "sceneVisualLayerChange", req.body);

            res.json({ack: true, message: "not implemented"});
        });

        /**
         * @swagger
         * /playback/scene/config/apply/byname:
         *  post:
         *      description: Applies a pre authored named config for a scene
         *      consumes:
         *          - application/json
         *      produces:
         *          - application/json
         *      parameters:
         *          - in: body
         *            name: applyNamedSceneConfig
         *            description: Scene id and config name required
         *            required: true
         *            schema:
         *                $ref: '#/definitions/ApplyNamedSceneConfig'
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
        router.post('/scene/config/apply/byname', function (req, res) {
            console.log("/playback/scene/config/apply/byname");
            console.log(req.body);

            let roomId = "";

            self.commandAPIController.sendCommand(roomId, CommandAPIController.getCommandKeys().PLAYBACK_SCENE_CONFIG_APPLY_BY_NAME, req.body);

            res.json({ack: true});
        });

        /**
         * @swagger
         * /playback/scene/config/apply:
         *  post:
         *      description: Applies a new named config for a scene (runtime only)
         *      consumes:
         *          - application/json
         *      produces:
         *          - application/json
         *      parameters:
         *          - in: body
         *            name: applySceneConfig
         *            description: A valid scene config
         *            required: true
         *            schema:
         *                $ref: '#/definitions/ApplySceneConfig'
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
        router.post('/scene/config/apply', function (req, res) {
            console.log("/playback/scene/config/apply");
            console.log(req.body);

            let roomId = "";

            self.commandAPIController.sendCommand(roomId, CommandAPIController.getCommandKeys().PLAYBACK_SCENE_CONFIG_APPLY, req.body);

            res.json({ack: true});
        });

        /**
         * @swagger
         * /playback/scenes/themes/show:
         *  post:
         *      description: Playback scene and theme combinations from the provided scenes and themes.  This API call is designed to be used as a single shot of every scene-theme you want to playback.
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
        router.post('/scenes/themes/show', function (req, res) {

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
         * /playback/scenes/themes/reset:
         *  post:
         *      description: Reset the playback engine
         *      consumes:
         *          - application/json
         *      produces:
         *          - application/json
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
        router.post('/scenes/themes/reset', function (req, res) {

            console.log("/playback/scenes/themes/show");

            // APEP 010618 for now the reset can just reset by providing an empty bucket.
            // this is likely to change in the future.

            let roomid = ""

            let play = {
                scenes: [],
                themes: []
            }

            self.commandAPIController.playSceneAndThemes(roomid, play);

            res.json({ack: true});
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
        router.post('/scenes/show', function (req, res) {

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
        router.post('/scene/show', function (req, res) {

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
         *            name: body
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
        router.post('/scene/theme/show', function (req, res) {

            console.log("/playback/scene/theme/show'");
            console.log(req.body);

            let roomId = req.body.roomId;
            let commandName = CommandAPIController.getCommandKeys().PLAY_SCENE_THEME_SINGULAR_COMMAND_NAME;
            let commandValue = _.pick(req.body, ["sceneTheme", "volume"]);

            self.commandAPIController.sendCommand(roomId, commandName, commandValue);
            res.json({ack: true});
        });

        /**
         * @swagger
         * /playback/scene/theme/stop:
         *  post:
         *      description: Stop a scene theme
         *      consumes:
         *          - application/json
         *      produces:
         *          - application/json
         *      parameters:
         *          - in: body
         *            name: body
         *            description: Stop a play request
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
        router.post('/scene/theme/stop', function (req, res) {

            console.log("/playback/scene/theme/stop'");
            console.log(req.body);

            let roomId = req.body.roomId;
            let commandName = CommandAPIController.getCommandKeys().PLAY_SCENE_THEME_SINGULAR_COMMAND_NAME;
            let commandValue = _.pick(req.body, ["sceneTheme", "volume"]);

            self.commandAPIController.sendCommand(roomId, commandName, commandValue);
            res.json({ack: true});
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
        router.post('/theme/show', function (req, res) {
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
        router.post('/tag/matcher/set', function (req, res) {
            //TODO: AP implement in hub
            console.log(req.body)
            self.commandAPIController.sendCommand(req.body.roomId,"setTagMatcher", {
                matcher:req.body.matcher
            }, function (res) {
                res.json({ack: true});
            });
        });

        /**
         * @swagger
         * /playback/controller/html/random/reset:
         *  post:
         *      description: Restart the html random controller for dynamic data updates
         *      consumes:
         *          - application/json
         *      produces:
         *          - application/json
         *      security:
         *          - APIKeyHeader: []
         *      responses:
         *          200:
         *              description: Result from AWS
         *              type: object
         *              properties:
         *                  ResponseMetadata:
         *                      type: object
         *                      properties:
         *                          RequestId:
         *                              type: string
         *          400:
         *              description: Error from AWS
         *              type: object
         */
        router.post('/controller/html/random/reset', function (req, res) {
            let elasticbeanstalk = new AWS.ElasticBeanstalk({region: "eu-west-1"});

            elasticbeanstalk.restartAppServer(self.HTML_RANDOM_CONTROLLER_RESET_PARAMS, function(err, data) {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                    return res.status(400).json(err);
                } else {
                    console.log(data);           // successful response
                    return res.status(200).json(data);
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
        router.post('/media/show', function (req, res) {
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
        router.post('/media/transitioning', function (req, res) {
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
        router.post('/media/done', function (req, res) {
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
        router.post('/iot/data', function (req, res) {
            res.json({ack: true});
        });

        return router;
    }

    sceneRoutes() {

        let self = this;

        let router = express.Router();

        self.app.use(self.requireToken.bind(self), router);

        // APEP helper for any scene based DB call that returns a MediaSceneSchema in the API
        function convertDatabaseThemeToSchemaFriendly(sceneJson) {
            if (! sceneJson.hasOwnProperty("themes")) {
                return [];
            }

            return _.map(Object.keys(sceneJson.themes), function (themeName) {
                let themeValue = sceneJson.themes[themeName];

                return {
                    name: themeName,
                    value: themeValue
                }
            });
        }

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
        router.get('/list', function (req, res) {

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
        router.get('/find/by/name', function (req, res) {

            const sceneName = req.get("sceneName");

            console.log(`scene/find/by/name  - sceneName: ${sceneName}`);

            self.dataController.loadSceneByName(sceneName, function (err, sceneJson) {
                if (err) {
                    return res.status(400);
                } else {

                    sceneJson.themes = convertDatabaseThemeToSchemaFriendly(sceneJson);

                    return res.status(200).send(sceneJson);
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
        router.get('/full', function (req, res) {
            console.log({sceneId: req.get("sceneId"), token: req.get(self.API_KEY_HEADER)});
            request
                .post({
                    url: process.env.ASSET_STORE + "/api/scene/full",
                    formData: {sceneId: req.get("sceneId"), token: req.get(self.API_KEY_HEADER)}
                }, function (err, httpResponse, body) {
                    if (err) {
                        res.status(400).json({message: JSON.stringify(err)});
                    } else {
                        let sceneJson = JSON.parse(body);

                        sceneJson.themes = convertDatabaseThemeToSchemaFriendly(sceneJson);

                        // APEP we need to convert the themes from JS notation to something that works in a schema
                        res.status(200).json(sceneJson);
                    }
                });
        });

        return router;
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

            const apiLimiter = new RateLimit({
                windowMs: 1000, // 1 second
                max: 1000,
                delayMs: 0 // disabled
            });

            // rate limit the audio call
            self.app.use('/playback/scene/audio/', apiLimiter);

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


            let playbackRouter = self.playbackRoutes().bind(self);
            self.app.use('/playback', playbackRouter);

            let sceneRouter = self.sceneRoutes().bind(self);
            self.app.use('/scene', sceneRouter);

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