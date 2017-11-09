"use strict";

const LegacyHubController = require("uos-legacy-hub-controller/src/hub-controller");
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUiAssetPath = require("swagger-ui-dist").getAbsoluteFSPath();
const path = require("path");
const morgan = require('morgan');
const WS_GENERATED_DOCS_FOLDER = "../async-websocket-api-docs";

class MediaframeworkHubController extends LegacyHubController {

    constructor(config, optMediaHubConnection) {
        console.log("MediaframeworkHubController - constructor");

        super(config, optMediaHubConnection);

        this.router = express.Router();
        this.app.use(bodyParser.json());
        this.config = config;

        this.app.use(morgan('combined'));

        this.app.use("/ws-docs", express.static(path.resolve(path.join(__dirname, WS_GENERATED_DOCS_FOLDER))));
        this.app.use("/rest-docs", express.static(swaggerUiAssetPath));
    }
}

module.exports = MediaframeworkHubController;