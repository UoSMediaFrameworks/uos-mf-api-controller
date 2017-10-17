"use strict";

const Configuration = require("uos-legacy-hub-controller/configuration");

class SwaggerSpecConfiguration extends Configuration {
    constructor(swaggerSpec) {
        super();
        this.swaggerSpec = swaggerSpec;
    }
}

module.exports = SwaggerSpecConfiguration;