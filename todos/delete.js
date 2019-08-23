'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const common = require('./common');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.delete = (event, context, callback) => {
    console.debug('Input event: ' + JSON.stringify(event));

    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            id: event.pathParameters.id,
        },
        ReturnValues: 'ALL_OLD'
    };

    // delete the todo from the database
    dynamoDb.delete(params, (error, result) => {
        // handle potential errors
        if (error) {
            common.handleDynamoDbError(error, callback);
            return;
        }

        if (!('Attributes' in result)) {
            common.handleItemNotFound(event.pathParameters.id, callback);
            return;
        }
        
        // create a response
        const response = {
            statusCode: 204,
        };
        callback(null, response);
    });
};