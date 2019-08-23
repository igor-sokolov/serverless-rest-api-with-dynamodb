'use strict';

const etag = require('etag');

module.exports = {
    convertDynamoItem : function(item) {
        return {
            id: item.id,
            text: item.text,
            checked: item.checked,
        };
    },

    calculateEtag : function(item) {
        const val = etag(JSON.stringify(item)); 
        // remove \" symbols
        return val.substring(1, val.length - 1);
    },

    handleDynamoDbError : function(error, callback) {
        console.error(error);
        callback(null, {
            statusCode: 502,
            body: JSON.stringify( { message : 'An error occured in an external system' })
        });
    },

    handleItemNotFound : function(itemId, callback) {
        console.info('An item with ID = ' + itemId + ' was not found' );
        callback(null, {
            statusCode: 404,
            body: JSON.stringify( { message : 'An item with ID = ' + itemId + ' was not found' })
        });
    },

    handleValidationError : function(reason, callback) {
        console.info('Validation Failed: ' + reason);
        callback(null, {
            statusCode: 400,
            body: JSON.stringify( { message : 'Validation Failed: ' + reason })
        });
    },

    handleOptimisticLockFailed : function(callback) {
        console.info('Optimistic lock failed');
        callback(null, {
            statusCode: 412,
            body: JSON.stringify( { message : 'Optimistic lock failed' })
        });
    },

    prepareHeaders : function(item) {
        return {
            'Todo-CreatedAt': new Date(item.createdAt).toISOString(),
            'Todo-UpdatedAt': new Date(item.updatedAt).toISOString(),
            'ETag': item.etag
        };
    }
} 

