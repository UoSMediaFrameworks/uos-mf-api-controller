
// APEP Mongoose schema documentation http://mongoosejs.com/docs/schematypes.html

const m2s = require('mongoose-to-swagger');
const fs = require('fs');
const yamljs = require('yamljs');
const _ = require('lodash');

/**
 * Example of Open API 2.0 output we can use for visual confirmation
 * Ideally we need to look at a swagger definition spec validator.
 * https://github.com/OAI/OpenAPI-Specification/blob/master/examples/v2.0/json/petstore-with-external-docs.json
 */
const MediaSceneSchema = require('uos-mf-db-schemas/src/media-scenes/media-scene-schema');
const MaxOnScreenSchema = require('uos-mf-db-schemas/src/media-scenes/maximum-on-screen-schema');
const MediaAssetSchema = require('uos-mf-db-schemas/src/media-scenes/media-asset-schema');

const VideoMediaObjectSchema = require('uos-mf-db-schemas/src/media-objects/video-media-object-schema');
const ImageMediaObjectSchema = require('uos-mf-db-schemas/src/media-objects/image-media-object-schema');
const AudioMediaObjectSchema = require('uos-mf-db-schemas/src/media-objects/audio-media-object-schema');

const MediaSceneSwaggerSchema = m2s(MediaSceneSchema, "MediaSceneSchema");
const MaxOnScreenSwaggerSchema = m2s(MaxOnScreenSchema, "MaxOnScreenSchema");
const MediaAssetSwaggerSchema = m2s(MediaAssetSchema, "MediaAssetSchema");
const VideoMediaObjectSwaggerSchema = m2s(VideoMediaObjectSchema, "VideoMediaObjectSchema");
const ImageMediaObjectSwaggerSchema = m2s(ImageMediaObjectSchema, "ImageMediaObjectSchema");
const AudioMediaObjectSwaggerSchema = m2s(AudioMediaObjectSchema, "AudioMediaObjectSchema");

const swaggerModelDefinitions = {
    "definitions": _.merge(MediaSceneSwaggerSchema, MediaAssetSwaggerSchema, MaxOnScreenSwaggerSchema, VideoMediaObjectSwaggerSchema,
        ImageMediaObjectSwaggerSchema, AudioMediaObjectSwaggerSchema)
};

fs.writeFile('./db-schema-json-docs/db-schema.json', JSON.stringify(swaggerModelDefinitions), 'utf8', function() {
    console.log("db-schema.json - record file created");

    fs.writeFile('./db-schema-json-docs/db-schema.yaml', yamljs.stringify(swaggerModelDefinitions), 'utf8', function() {
        console.log("db-schema.yaml - record file created");
        process.exit(1);
    });
});





