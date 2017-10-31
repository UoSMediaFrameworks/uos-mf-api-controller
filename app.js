'use strict';

const MediaframeApiController = require('./src/mf-api-controller');
const SwaggerSpecConfiguration = require("./src/swagger-spec-configuration");
const swaggerJSDoc = require('swagger-jsdoc');

// APEP sample documentation
// https://github.com/Surnet/swagger-jsdoc/blob/master/example/app.js
const options = {
    swaggerDefinition: {
        info: {
            title: 'uos-legacy-hub-controller', // Title (required)
            version: '0.0.2', // Version (required)
        },
        "host": "dev-uos-mf-api.eu-west-1.elasticbeanstalk.com"
    },
    apis: ['./src/mf-api-controller.js', './db-schema-json-docs/media-scene-schema.yaml'], // Path to the API docs
};
const swaggerSpec = swaggerJSDoc(options);
const appConf = new SwaggerSpecConfiguration(swaggerSpec);

const apiController = new MediaframeApiController(appConf);

apiController.init(function() {

});