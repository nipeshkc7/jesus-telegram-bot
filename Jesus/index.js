const axios = require('axios');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;

async function createItem(item) {
    // const params = {
    //     TableName: 'People',
    //     Item: {
    //         id: '12345',
    //         price: 100.00
    //     }
    // }

    try {
        await docClient.put({
            TableName: tableName,
            Item: item
        }).promise();

    } catch (err) {
        console.error(`Error Creating Item ${err.message}`);
        console.log(err);
        return err;
    }
}

async function getItem(id) {
    // const params = {
    //     TableName: 'People',
    //     Key: {
    //         id: '1'
    //     }
    // };

    const data = await docClient.get({
        TableName: tableName,
        Key: {
            id: id
        }
    }).promise();

    return data.Item.message;
}

exports.handler = async (event, context, callback) => {

    const body = JSON.parse(event.body);
    const reply = processMessage(body.message);

    try {
        await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${body.message.chat.id}&text=${encodeURI(reply.text)}`)
        if(reply.gif) {
            const gif = await axios.get(`https://g.tenor.com/v1/random?key=${process.env.TENOR_KEY}&q=${encodeURI(reply.gif)}&limit=1`);
            await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendAnimation?chat_id=${body.message.chat.id}&animation=${encodeURI(gif.data.results[0].media[0].gif.url)}`)
        }
    } catch (e) {
        console.error('Error sending message', e);
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify('OK')
    };

    callback(null, response);

};

