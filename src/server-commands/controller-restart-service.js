'use strict'

const AWS = require('aws-sdk');

class ControllerRestartService {
    constructor(config) {
        this.config = config;
    }

    restart() {
        throw new Error("generic controller restart service is not available");
    }
}

class Pm2ControllerRestartService extends ControllerRestartService {
    constructor(config) {
        super(config);
    }

    restart() {
        return new Promise((resolve, reject) => {
            this.elasticbeanstalk.restartAppServer(self.HTML_RANDOM_CONTROLLER_RESET_PARAMS, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        })
    }
}

class AwsControllerRestartService extends ControllerRestartService {
    constructor(config) {
        super(config);

        this.HTML_RANDOM_CONTROLLER_RESET_PARAMS = {
            EnvironmentId: config.htmlControllerEnvironmentId,
            EnvironmentName: config.htmlControllerEnvironmentName
        };

        this.elasticbeanstalk = new AWS.ElasticBeanstalk({region: "eu-west-1"});
    }

    restart() {
        return new Promise((resolve, reject) => {
            this.elasticbeanstalk.restartAppServer(this.HTML_RANDOM_CONTROLLER_RESET_PARAMS, function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        })
    }
}