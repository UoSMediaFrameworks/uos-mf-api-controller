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
            version: '0.0.6', // Version (required)
        },
        "host": process.env.SWAGGER_HOST || "localhost:3000",
        "schemes": ["http"]
    },
    apis: [
        './schemas/api-dto-schema-docs/api-dtos.yaml',
        './src/mf-api-controller.js',
        './schemas/db-schema-docs/db-schema.yaml'
    ]
};

const swaggerSpec = swaggerJSDoc(options);

class SwaggerAndAWSConf extends SwaggerSpecConfiguration {
    constructor(swaggerSpec) {
        super();
        this.swaggerSpec = swaggerSpec;
        this.htmlControllerEnvironmentId = process.env.HTML_RANDOM_CONTROLLER_ENV_ID;
        this.htmlControllerEnvironmentName = process.env.HTML_RANDOM_CONTROLLER_ENV_NAME;
    }
}

const appConf = new SwaggerAndAWSConf(swaggerSpec);


const apiController = new MediaframeApiController(appConf);

apiController.init(function() {

});