# mediaframework api controller
The first controller supporting the API with documentation

## Environment and running

Follow precedence of MF, .sh environment files can be used to export environment properties

Command to start the application

```./dev-env.sh node app.js```

## Testing and running

Take note of the integration-tests, they require configuration.

Command to run all the tests

```mocha --recursive test```

## Create mongoose schema objects to be included as definitions

This is now defunct.  The current tool chain does not understand nested schemas so we have to keep up to date manually.

If we can implement some properties evaulation to replace nested schemas with a $ref link rather than a copy, this is ideal.
Without this, the client libraries generated have too many duplicate classes

TODO improvements required
1. Review turning this into a CLI tool
2. Make this tool more reusable
3. Complete all schema in and out files for loading in app.js
4. Review making this a non manual process

Using the tool wrapped in a script, we can generate the required definitions as separate files.

These are then included within app.js

```bash
node tools/convert-mongoose-schemas-to-swagger.js
```

## Swagger & UI

The swagger interface for exploring the REST api can be found [host]:[port]/rest-docs

The JSON document lives at [host]:[port]/api-docs.json

## Building a UWP client from Swagger Open Api standards

The project includes the codegen cli tool required, below is the command required.

```bash
java -jar swagger-codegen-cli-2.2.3.jar generate -c uwp_config.json -i http://localhost:3000/api-docs.json -l csharp -o dist/uwp_api_client_<version>
```

Building from deployed environment requires an adjustment of the URL.

### Building from deployed environment

```bash
java -jar swagger-codegen-cli-2.2.3.jar generate -c uwp_config.json -i <host:port>/api-docs.json -l csharp -o dist/uwp_api_client_<version>
java -jar swagger-codegen-cli-2.2.3.jar generate -c uwp_config.json -i http://dev-uos-mf-api.eu-west-1.elasticbeanstalk.com/api-docs.json -l csharp -o dist/uwp_api_client_0_0_3rc9
```

## TODO Building a nodejs client

1. Develop the command
2. Use in the test environment for testing the REST interface application.

```bash
java -jar swagger-codegen-cli-2.2.3.jar generate -i <host:port>/api-docs.json -l javascript -o dist/js_api_client_<version>
java -jar swagger-codegen-cli-2.2.3.jar generate -i http://dev-uos-mf-api.eu-west-1.elasticbeanstalk.com/api-docs.json -l javascript -o dist/js_api_client_0_0_3rc6
java -jar swagger-codegen-cli-2.2.3.jar generate -i http://localhost:3000/api-docs.json -l javascript -o dist/js_api_client_0_0_3rc6
```

## Async API

The async API documentation can be found [host]:[port]/ws-docs

We currently have to manually keep this up to date.  Current version requires some attention to detail.

#### How to build documentation

##### Prerequisite  

install npm install -g asyncapi-docgen

(Caveat - requires node 7.6.x+, this conflicts with our current nodejs version. [nvm](https://github.com/creationix/nvm) or any nodejs installation manager can be used to easily toggle versions for using this tool)

Warning: If you wish to include the version in the generated results, alter below command.

We can improve our approach here.

```bash
asyncapi-docgen ./async-websocket-api.yaml ./async-websocket-api-docs
```


