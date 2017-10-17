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

## Swagger & UI

The swagger interface for exploring the REST api can be found [host]:[port]/rest-docs

The JSON document lives at [host]:[port]/api-docs.json

## Building a UWP client from Swagger Open Api standards

```bash
java -jar swagger-codegen-cli-2.2.3.jar generate -c uwp_config.json -i http://localhost:3000/api-docs.json -l csharp -o dist/uwp_api_client
```

## TODO Building a nodejs client

1. Develop the command
2. Use in the test environment for testing the REST interface application.

## Async API

The async API documentation can be found [host]:[port]/ws-docs

How to build documentation

Warning: If you wish to include the version in the generated results, alter below command.

We can improve our approach here.

```bash
asyncapi-docgen ./async-websocket-api.yaml ./async-websocket-api-docs

```

