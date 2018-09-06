'use strict';

const AWS = require('aws-sdk');
const pm2 = require('pm2');

class ControllerRestartService {
    constructor(config) {
        this.config = config;

        this.HTML_RANDOM_CONTROLLER_RESET_PARAMS = {
            EnvironmentId: config.htmlControllerEnvironmentId,
            EnvironmentName: config.htmlControllerEnvironmentName
        };
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
        let self = this;
        return new Promise((resolve, reject) => {
            pm2.connect(function(err) {
                if (err) {
                    console.log("pm2 failed to connect");
                    console.log(err);
                    return reject(err);
                }

                pm2.restart(self.HTML_RANDOM_CONTROLLER_RESET_PARAMS.EnvironmentName, function(err, proc) {
                   if (err) {
                       console.log("pm2 failed to restart controller");
                       console.log(err);
                       return reject(err);
                   }

                   console.log("successful pm2 restart");
                   console.log(proc);

                   pm2.disconnect(function () {
                       resolve();
                   });
                });
            });
        })
    }
}

class AwsControllerRestartService extends ControllerRestartService {
    constructor(config) {
        super(config);

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

module.exports.AwsControllerRestartService = AwsControllerRestartService;
module.exports.Pm2ControllerRestartService = Pm2ControllerRestartService;
module.exports.ControllerRestartService = ControllerRestartService;
module.exports.LOCAL_ENV_CONTROLLER = "pm2";