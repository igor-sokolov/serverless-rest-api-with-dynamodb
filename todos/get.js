'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const common = require('./common');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.get = (event, context, callback) => {
    console.debug('Input event: ' + JSON.stringify(event));
    
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            id: event.pathParameters.id,
        },
    };

    // fetch an item from the database
    dynamoDb.get(params, (error, result) => {
        // handle potential errors
        if (error) {
            common.handleDynamoDbError(error, callback);
            return;
        }

        // if ToDo is not found
        if (!('Item' in result)) {
            common.handleItemNotFound(event.pathParameters.id, callback);
            return;
        }

        const item = result.Item;

        const response = {
            statusCode: 200,
            body: JSON.stringify(common.convertDynamoItem(item)),
            headers: common.prepareHeaders(item)
        };

        callback(null, response);
    });
};