
// APEP currently I've just copy and pasted some schemas for testing
// TODO : APEP we will really need to separate out the mongoose schemas because of the plugin we use in the asset store.
// Then this and the asset store project can use the lib with schemas only.

// APEP Mongoose schema documentation http://mongoosejs.com/docs/schematypes.html

const m2s = require('mongoose-to-swagger');
const fs = require('fs');
const yamljs = require('yamljs');

/**
 * Example of Open API 2.0 output we can use for visual confirmation
 * Ideally we need to look at a swagger definition spec validator.
 * https://github.com/OAI/OpenAPI-Specification/blob/master/examples/v2.0/json/petstore-with-external-docs.json
 */
const schemaName = "MediaSceneSchema";
const MediaSceneSchema = require('uos-mf-db-schemas/src/media-scenes/media-scene-schema');
const swaggerSchema = m2s(MediaSceneSchema, schemaName);

const swaggerModelDefinitions = {
    "definitions": swaggerSchema
};

fs.writeFile('./db-schema-json-docs/media-scene-schema-0.0.1.json', JSON.stringify(swaggerModelDefinitions), 'utf8', function() {
    console.log("media-scene-schema.json - record file created");

    fs.writeFile('./db-schema-json-docs/media-scene-schema-0.0.1.yaml', yamljs.stringify(swaggerModelDefinitions), 'utf8', function() {
        console.log("media-scene-schema.yaml - record file created");
        process.exit(1);
    });
});





