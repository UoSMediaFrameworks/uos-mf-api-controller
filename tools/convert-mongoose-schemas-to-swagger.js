
// APEP currently I've just copy and pasted some schemas for testing
// TODO : APEP we will really need to separate out the mongoose schemas because of the plugin we use in the asset store.
// Then this and the asset store project can use the lib with schemas only.

// APEP Mongoose schema documentation http://mongoosejs.com/docs/schematypes.html

const m2s = require('mongoose-to-swagger');
const mongoose = require('mongoose');
const fs = require('fs');

const VideoSchema = new mongoose.Schema({
    path: String,
    hasTranscoded: { type: Boolean, default: false},

    transcoder: Number, //simple odd or even for basic parallelisation of transcoding
    vimeoId: String,
    description: String,

    uploadedTimestamp: { type: String, default: "" },
    transcodedTimestamp:  { type: String, default: "" },
    transcodingStartedTimestamp: { type: String, default: "" },
    video: Object // APEP we could look at describing this using the crate plugin.
});

const ImageSchema = new mongoose.Schema({
    path: String,
    sceneId: String,
    image: Object,
    thumbnail: Object,
    resized: Object
});

const AudioSchema = new mongoose.Schema({
    path: String,
    hasTranscoded: { type: Boolean, default: false},

    description: String,

    uploadedTimestamp: { type: String, default: "" },
    transcodedTimestamp:  { type: String, default: "" },
    transcodingStartedTimestamp: { type: String, default: "" },

    audio: Object
});

const MediaAsset = new mongoose.Schema({
    "type": String,
    "url": {
        type: String,
        required: false
    },
    "vmob": {
        type: VideoSchema,
        required: false
    },
    "imob": {
        type: ImageSchema,
        required: false
    },
    "amob": {
        type: AudioSchema,
        required: false
    }
});

const MaxOnScreen = new mongoose.Schema({
    "audio": Number,
    "image": Number,
    "video": Number,
    "text": Number
});

const MediaSceneSchema = new mongoose.Schema({
    name: String,
    maximumOnScreen: MaxOnScreen,
    scene: [MediaAsset],
});

/**
 * Example of Open API 2.0 output we can use for visual confirmation
 * Ideally we need to look at a swagger definition spec validator.
 * https://github.com/OAI/OpenAPI-Specification/blob/master/examples/v2.0/json/petstore-with-external-docs.json
 */
const schemaName = "MediaSceneSchema";
const swaggerSchema = m2s(MediaSceneSchema, schemaName);

const swaggerModelDefinitions = {
    "definitions": swaggerSchema
};

fs.writeFile('./db-schema-json-docs/media-scene-schema.json', JSON.stringify(swaggerModelDefinitions), 'utf8', function() {
    console.log("media-scene-schema.json - record file created");
    process.exit(1);
});



