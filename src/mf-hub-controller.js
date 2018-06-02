"use strict";

const LegacyHubController = require("uos-legacy-hub-controller/src/hub-controller");
const express = require('express');
const bodyParser = require('body-parser');

const swaggerUi = require("swagger-ui-dist"),
    swaggerUiAssetPath = swaggerUi.getAbsoluteFSPath();

const path = require("path");
const morgan = require('morgan');
const WS_GENERATED_DOCS_FOLDER = "../async-websocket-api-docs";
const DOCS_FOLDER = "../docs";

const oors = require('cors');

class MediaframeworkHubController extends LegacyHubController {

    constructor(config, optMediaHubConnection) {
        console.log("MediaframeworkHubController - constructor");

        super(config, optMediaHubConnection);

        this.API_KEY_HEADER = "X-API-Key";
        this.API_GROUP_ID_KEY = "X-API-GroupID";

        this.router = express.Router();
        this.app.use(bodyParser.json());

        // APEP we must allow CORS - ideally a whitelist but required as we have multiple web domains for MF tools
        // This is now required after initial web browser integration
        this.app.use(oors());
        this.config = config;

        this.app.use(morgan('combined'));

        this.app.use("/ws-docs", express.static(path.resolve(path.join(__dirname, WS_GENERATED_DOCS_FOLDER))));
        this.app.use("/rest-docs", express.static(path.resolve(path.join(__dirname, DOCS_FOLDER))));
        this.app.use("/rest-docs/api-spec-resources", express.static(swaggerUiAssetPath));
    }

    requireToken(req, res, next) {

        console.log("requireToken - check");

        if (req.method === "OPTIONS") {
            return next();
        }

        const token = req.get(this.API_KEY_HEADER);

        if (!token) {
            console.log("requireToken - check missing token in request header");
            return res.status(401).send({message: "check missing token in request header"});
        }

        // APEP we have a token, we need to check with the media hub if this is cool
        const creds = {token: token};

        var self = this;

        this.mediaHubConnection.attemptClientAuth(creds, function (err, token, roomId, groupId) {
            if (err) {
                console.log(`requireToken - check error: ${err}`);
                return res.status(401).send({message: "error checking with auth provider"});
            } else {
                console.log(`requireToken - check successful - groupId: ${groupId}`);

                // APEP using response.locals, we can pass data between this middleware function and the request handler.
                res.locals[self.API_GROUP_ID_KEY] = groupId;

                next();
            }
        });
    }
}

module.exports = MediaframeworkHubController;