'use strict';

const MediaframeApiController = require('./src/mf-api-controller');
const SwaggerSpecConfiguration = require("./src/swagger-spec-configuration");
const swaggerJSDoc = require('swagger-jsdoc');
const options = {
    swaggerDefinition: {
        info: {
            title: 'uos-legacy-hub-controller', // Title (required)
            version: '0.0.1', // Version (required)
        },
    },
    apis: ['./src/mf-api-controller.js'], // Path to the API docs
};
const swaggerSpec = swaggerJSDoc(options);
const appConf = new SwaggerSpecConfiguration(swaggerSpec);

const apiController = new MediaframeApiController(appConf);

apiController.init(function() {

});