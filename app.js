'use strict';

const MediaframeApiController = require('./src/mf-api-controller');
const SwaggerSpecConfiguration = require("./src/swagger-spec-configuration");
const swaggerJSDoc = require('swagger-jsdoc');

// APEP sample documentation
// https://github.com/Surnet/swagger-jsdoc/blob/master/example/app.js
const options = {
    swaggerDefinition: {
        info: {
            title: 'uos-mf-api-controller', // Title (required)
            version: '0.0.4', // Version (required)
        },
        "host": process.env.SWAGGER_HOST || "localhost:3000",
        "schemes": ["http"]
    },
    apis: ['./src/mf-api-controller.js', './db-schema-docs/db-schema.yaml'], // Path to the API docs
};
const swaggerSpec = swaggerJSDoc(options);
const appConf = new SwaggerSpecConfiguration(swaggerSpec);

const apiController = new MediaframeApiController(appConf);

apiController.init(function() {

});