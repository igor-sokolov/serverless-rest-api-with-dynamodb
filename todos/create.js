'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const common = require('./common');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
    console.debug('Input event: ' + JSON.stringify(event));
    
    const timestamp = new Date().getTime();
    const data = JSON.parse(event.body);

    const todo = {
        id: uuid.v4(),
        text: data.text,
        checked: false,
    };

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
            ...todo,
            etag: common.calculateEtag(todo),
            updatedAt: timestamp,
            createdAt: timestamp
        },
    };

    // Add an item to the database
    dynamoDb.put(params, (error) => {
        // handle potential errors
        if (error) {
            common.handleDynamoDbError(error, callback);
            return;
        }

        const item = params.Item;

        // create a response
        const response = {
            statusCode: 201,
            headers: {
                'Location': event.resource + "/" + item.id,
                ...common.prepareHeaders(item), 
            },
            body: JSON.stringify(common.convertDynamoItem(item)),
        };
        callback(null, response);
    });
};
