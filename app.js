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
            version: '0.1.2', // Version (required)
        },
        "host": process.env.SWAGGER_HOST || "localhost:3000",
        "schemes": ["http", "https"]
    },
    apis: [
        './schemas/security-schema.yaml',
        './schemas/db-schema-docs/db-schema.yaml',
        './schemas/api-dto-schema-docs/api-dtos.yaml',
        './src/mf-api-controller.js',
    ]
};


const swaggerSpec = swaggerJSDoc(options);

class SwaggerAndAWSConf extends SwaggerSpecConfiguration {
    constructor(swaggerSpec) {
        super(swaggerSpec);
        this.htmlControllerEnvironmentId = process.env.HTML_RANDOM_CONTROLLER_ENV_ID;
        this.htmlControllerEnvironmentName = process.env.HTML_RANDOM_CONTROLLER_ENV_NAME;
    }
}

const appConf = new SwaggerAndAWSConf(swaggerSpec);

// APEP debugging environment variables
// console.log(JSON.stringify(appConf));

const apiController = new MediaframeApiController(appConf);

apiController.init(function () {

});