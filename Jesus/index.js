const axios = require('axios');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME;
const { processMessage } = require('./processMessage');

async function getItem(id) {
    const data = await docClient.get({
        TableName: tableName,
        Key: {
            'id': id
        }
    }).promise();

    return data.Item;
}

async function update(id, item) {
    await docClient.put({
        TableName: tableName,
        Item: {
            ...item,
            id: id,
        }
    }).promise();
}

async function addMembers(chatId, message) {
    const newChatMembers = message.new_chat_members;
    const group = await getItem(Math.abs(chatId).toString()) ??
        (message.from.is_bot === true ?
            {} : { [message.from.first_name]: { id: message.from.id, spent: 0, owes: {} } }
        );

    newChatMembers.forEach(member => {
        if (!group[member.first_name]) {
            group[member.first_name] = {
                id: member.id,
                spent: 0,
                owes: {}
            }
        }
    });

    await docClient.put({
        TableName: tableName,
        Item: {
            people: {...group},
            id: Math.abs(chatId).toString(),
        }
    }).promise();

}

exports.handler = async (event) => {

    const body = JSON.parse(event.body);
    console.log(JSON.stringify(body, null, 2));

    if (body.message?.new_chat_members?.length) {
        await addMembers(body.message.chat.id, body.message);
        return {
            statusCode: 200,
            body: JSON.stringify('OK')
        }
    }

    if (!body.message?.text) {
        return {
            statusCode: 200,
            body: JSON.stringify('Nothing to do')
        }
    }

    const group = await getItem(Math.abs(body.message.chat.id).toString());
    console.log(`Updating existing group: ${JSON.stringify(group, null, 2)}`);

    if(!group) {
        return {
            statusCode: 200,
            body: JSON.stringify('No group found')
        }
    }

    const processedMessage = processMessage(body.message, group.people);

    if(processedMessage?.peopleRecords){
        await update(Math.abs(body.message.chatId).toString(), processedMessage.peopleRecords);
    }

    try {
        if (processedMessage.reply){
            await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${body.message.chat.id}&text=${encodeURI(processedMessage.reply)}`)
        }
        if (processedMessage.gif) {
            const gif = await axios.get(`https://g.tenor.com/v1/random?key=${process.env.TENOR_KEY}&q=${encodeURI(processedMessage.gif)}&limit=1`);
            await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendAnimation?chat_id=${body.message.chat.id}&animation=${encodeURI(gif.data.results[0].media[0].gif.url)}`)
        }
    } catch (e) {
        console.error('Error sending message', e);
        await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${body.message.chat.id}&text=${encodeURI('Problems with the server !')}`)
        // Optional: Throw error so Telegram webhook will retry
    }

    return {
        statusCode: 200,
        body: JSON.stringify('OK')
    };

};

