'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const common = require('./common');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.update = (event, context, callback) => {
    console.debug('Input event: ' + JSON.stringify(event));

    const timestamp = new Date().getTime();
    const data = JSON.parse(event.body);

    const item = {
        ...data,
        id: event.pathParameters.id,
        etag: common.calculateEtag(data),
        updatedAt: timestamp
    }

    var params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            id: item.id,
        },
        UpdateExpression: 'SET #todo_text = :text, checked = :checked, updatedAt = :updatedAt, etag = :newEtag',
        ExpressionAttributeNames: {
            '#todo_text': 'text',
        },
        ConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
            ':id': item.id,
            ':text': item.text,
            ':checked': item.checked,
            ':updatedAt': item.updatedAt,
            ':newEtag': item.etag
          },
        ReturnValues: 'ALL_NEW', // return all after update
    };

    // if there is 'If-Match' header in the request add conditional update to the request
    if (event.headers && 'If-Match' in event.headers) {
        params.ConditionExpression += ' and etag = :etag';
        params.ExpressionAttributeValues[':etag'] = event.headers['If-Match'];
    }

    // update the ADR in the database
    dynamoDb.update(params, (error, result) => {
        // handle potential errors
        if (error) {
            // if the failure is due to the conditional check
            if (error.code === 'ConditionalCheckFailedException') {
                handleConditionalCheckFailedException(event, item, callback)
            } else { // something else was wrong
                common.handleDynamoDbError(error, callback);
            }

            return;
        }
        
        const newItem = result.Attributes;

        console.debug(JSON.stringify(newItem));
        
        // create a response
        const response = {
            statusCode: 204,
            headers: common.prepareHeaders(newItem),
        };
    
        callback(null, response);

        console.debug(JSON.stringify(response));
    });
};

function handleConditionalCheckFailedException(event, item, callback) {
    // if no 'If-Match' header then clearly the item was not found
    if (!(event.headers && 'If-Match' in event.headers)) {
        common.handleItemNotFound(item.id, callback);
        return;   
    }

    // in another case there is no nice way to check which condition failed 
    // except only to try to retrieve item by ID
    const params = {
            TableName: process.env.DYNAMODB_TABLE,
            Key: {
                id: item.id,
            },
        };
    
    // fetch an TODO from the database
    dynamoDb.get(params, (error, result) => {
        // handle potential errors
        if (error) {
            common.handleDynamoDbError(error, callback);
            return;
        } 

        // ToDo is not found
        if (!('Item' in result)) {
            common.handleItemNotFound(item.id, callback);
            return;
        }

        console.debug(JSON.stringify(result.Item));

        // the item was found so it was etag condition
        common.handleOptimisticLockFailed(callback);
    });
}