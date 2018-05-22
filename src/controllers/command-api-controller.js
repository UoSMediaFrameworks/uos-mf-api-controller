"use strict";

const LegacyCommandAPIController = require("uos-legacy-hub-controller/src/modules/controllers/command-api-controller"),
    CommandApiKeys = LegacyCommandAPIController.getCommandKeys();

class CommandMediaFrameworkApiController extends LegacyCommandAPIController {
    constructor(mediaHubConnection, io) {
        console.log("CommandMediaFrameworkApiController - constructor");
        super(mediaHubConnection, io);
    }

    sendCommand(roomId, commandName, commandValue) {
        // APEP ensure we publish this for any legacy clients still connecting directly to the media hub
        this.mediaHubConnection.emit(CommandApiKeys.HUB.SEND_COMMAND, roomId, commandName, commandValue);

        // APEP publish for any clients connected directly to controller
        this.io.to(roomId).emit(commandName, {name: commandName, value: commandValue});
    }
}

module.exports = CommandMediaFrameworkApiController;