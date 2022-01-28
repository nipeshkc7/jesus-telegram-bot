const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;

async function get(id) {
    const data = await docClient.get({
        TableName: tableName,
        Key: {
            'id': id
        }
    }).promise();

    return data.Item;
}

async function upsert(id, item) {
    await docClient.put({
        TableName: tableName,
        Item: {
            ...item,
            id: id,
        }
    }).promise();
}

module.exports = {
    get,
    upsert
}