'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const common = require('./common');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.list = (event, context, callback) => {
    console.debug('Input event: ' + JSON.stringify(event));

    var params = {
        TableName: process.env.DYNAMODB_TABLE,
    };

    if (event.queryStringParameters && event.queryStringParameters.checked) {
        params.FilterExpression = 'checked = :checked';
        params.ExpressionAttributeValues = {':checked' : event.queryStringParameters.checked == 'true'};
    }

    // fetch all ToDo by creteria from the database
    dynamoDb.scan(params, (error, result) => {
        // handle potential errors
        if (error) {
            common.handleDynamoDbError(error, callback);
            return;
        }

        // create a response
        const response = {
            statusCode: 200,
            body: JSON.stringify(result.Items.map(common.convertDynamoItem)),
        };
        
        callback(null, response);
    });
};