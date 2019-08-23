# serverless-rest-api-with-dynamodb
This example demonstrates how to setup a RESTful Web Services allowing you to create, list, get, update and delete Todos. DynamoDB is used to store the data. This is just an example and of course you could use any data storage as a backend.

## Structure
This service has a separate directory for all the todo operations. For each operation exactly one file exists e.g. `todos/delete.js`. In each of these files there is exactly one function which is directly attached to module.exports. 

All common functionality (like error handling, headers and body convertors) are extracted into a separate module called `common.js`

## Use-cases
API for a Web Application
API for a Mobile Application

## Setup
```bash
npm install
```

## Deploy

In order to deploy the endpoint simply run

```bash
serverless deploy
```

The expected result should be similar to:

```bash
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service serverless-rest-api-with-dynamodb.zip file to S3 (37.11 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
........................................
Serverless: Stack update finished...
Service Information
service: serverless-rest-api-with-dynamodb
stage: dev
region: us-east-1
stack: serverless-rest-api-with-dynamodb-dev
resources: 39
api keys:
  None
endpoints:
  POST - https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos
  GET - https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
  PUT - https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
  DELETE - https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/{id}
  GET - https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos
functions:
  create: serverless-rest-api-with-dynamodb-dev-create
  get: serverless-rest-api-with-dynamodb-dev-get
  update: serverless-rest-api-with-dynamodb-dev-update
  delete: serverless-rest-api-with-dynamodb-dev-delete
  list: serverless-rest-api-with-dynamodb-dev-list
layers:
  None

```

## Usage

You can create, retrieve, update, or delete todos with the following [httpie](https://httpie.org) commands presented below.
Some HTTP headers in result examples are omitted intentionally.

### Create a Todo

```bash
http POST https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos text="Complete the article"
```

Example Result:
```bash
HTTP/1.1 201 Created
Content-Type: application/json
ETag: 5b-ChVMUWLGV9jc88tQjqJoEFTp6DA
Location: /todos/5a900031-0bd9-4f47-adec-ea2d6e2243cb
Todo-CreatedAt: 2019-08-23T15:56:52.582Z
Todo-UpdatedAt: 2019-08-23T15:56:52.582Z

{
    "checked": false,
    "id": "5a900031-0bd9-4f47-adec-ea2d6e2243cb",
    "text": "Complete the article"
}
```

### List all Todos

```bash
$ http https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/
```

Example output:
```bash
HTTP/1.1 200 OK
Content-Type: application/json

[
    {
        "checked": false,
        "id": "5a900031-0bd9-4f47-adec-ea2d6e2243cb",
        "text": "Complete the article"
    },
    {
        "checked": true,
        "id": "5b6060f5-b3b3-435e-88f7-64f80763df37",
        "text": "Complete the article"
    },
    {
        "checked": false,
        "id": "48abcfa4-dc8d-4a3f-afa7-328bb64533e6",
        "text": "Complete the article"
    }
]
```

### List all not completed Todos

```bash
$ http https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos?checked=false
```
Example Result:
```bash
HTTP/1.1 200 OK

[
    {
        "checked": false,
        "id": "5a900031-0bd9-4f47-adec-ea2d6e2243cb",
        "text": "Complete the article"
    },
    {
        "checked": false,
        "id": "48abcfa4-dc8d-4a3f-afa7-328bb64533e6",
        "text": "Complete the article"
    }
]
```

### Get one Todo
1. Todo is found:
```bash
$ http https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/5a900031-0bd9-4f47-adec-ea2d6e2243cb
```

Example Result:
```bash
HTTP/1.1 200 OK
Content-Type: application/json
ETag: 5b-ChVMUWLGV9jc88tQjqJoEFTp6DA
Todo-CreatedAt: 2019-08-23T15:56:52.582Z
Todo-UpdatedAt: 2019-08-23T15:56:52.582Z

{
    "checked": false,
    "id": "5a900031-0bd9-4f47-adec-ea2d6e2243cb",
    "text": "Complete the article"
}
```

2. Todo is not found:
```bash
$ http https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/42
```

Example Result:
```bash
HTTP/1.1 404 Not Found
Content-Type: application/json

{
    "message": "An item with ID = 42 was not found"
}
```

### Update a Todo
1. Update with an uptodate ETag value:
```bash
$ http PUT https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/5a900031-0bd9-4f47-adec-ea2d6e2243cb If-Match:5b-ChVMUWLGV9jc88tQjqJoEFTp6DA id="5a900031-0bd9-4f47-adec-ea2d6e2243cb" checked:=true text="Complete the article"
```

Example Result:
```bash
HTTP/1.1 204 No Content
Content-Type: application/json
ETag: 5a-DRdd4Ffk8Coi9GE6osXdAFjloFM
Todo-CreatedAt: 2019-08-23T15:56:52.582Z
Todo-UpdatedAt: 2019-08-23T16:06:14.916Z

```

2. Update with an outdated ETag value:
```bash
$ http PUT https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/5a900031-0bd9-4f47-adec-ea2d6e2243cb If-Match:42 id="5a900031-0bd9-4f47-adec-ea2d6e2243cb" checked:=true text="Complete the article"
```

Example Result:
```bash
HTTP/1.1 412 Precondition Failed
Content-Type: application/json

{
    "message": "Optimistic lock failed"
}
```

### Delete a Todo

```bash
$ http DELETE https://XXXXXXX.execute-api.us-east-1.amazonaws.com/dev/todos/5a900031-0bd9-4f47-adec-ea2d6e2243cb
```

Example Result:
```bash
HTTP/1.1 204 No Content

```

## Scaling

### AWS Lambda

By default, AWS Lambda limits the total concurrent executions across all functions within a given region to 100. The default limit is a safety limit that protects you from costs due to potential runaway or recursive functions during initial development and testing. To increase this limit above the default, follow the steps in [To request a limit increase for concurrent executions](http://docs.aws.amazon.com/lambda/latest/dg/concurrent-executions.html#increase-concurrent-executions-limit).

### DynamoDB

When you create a table, you specify how much provisioned throughput capacity you want to reserve for reads and writes. DynamoDB will reserve the necessary resources to meet your throughput needs while ensuring consistent, low-latency performance. You can change the provisioned throughput and increasing or decreasing capacity as needed.

This is can be done via settings in the `serverless.yml`.

```yaml
  ProvisionedThroughput:
    ReadCapacityUnits: 1
    WriteCapacityUnits: 1
```

In case you expect a lot of traffic fluctuation we recommend to checkout this guide on how to auto scale DynamoDB [https://aws.amazon.com/blogs/aws/auto-scale-dynamodb-with-dynamic-dynamodb/](https://aws.amazon.com/blogs/aws/auto-scale-dynamodb-with-dynamic-dynamodb/)
