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

    return data.Item;
}

// async function updateItem(id, item) {
//     const data = await docClient.update({
//         TableName: tableName,
//         Key: {
//             id: id
//         },
//         UpdateExpression: 'set message = :r',
//         ExpressionAttributeValues: {
//             ':r': item
//         },
//         ReturnValues: 'UPDATED_NEW'
//     }).promise();

//     return data;
// }

// async function updateItem(id, item){
//     const data = await docClient.put({
//         TableName: tableName,
//         Item: {
//             ...item
//         }

//     })
// }

async function update(id, item){
    await docClient.put({
        TableName: tableName,
        Item: {
            ...item,
            id: id,
        }
    }).promise(); 
}

async function addMembers(chatId, newChatMembers){
    const group = await getItem(chatId) ?? {};
    newChatMembers.forEach(member =>{
        if(!group[member.first_name]){
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
            ...group,
            id: Math.abs(chatId).toString(),
        }
    }).promise();
    
}

exports.handler = async (event, context, callback) => {

    const body = JSON.parse(event.body);
    console.log(JSON.stringify(body, null, 2));

    if(body.message?.new_chat_members?.length) {
        await addMembers(body.message.chat.id, body.message.new_chat_members);
    }

    const existingPeopleRecords = await getItem(Math.abs(body.message.chatId).toString());

    const { peopleRecords, reply, gif } = processMessage(body.message, existingPeopleRecords);

    update(Math.abs(body.message.chatId).toString(), peopleRecords);

    try {
        await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${body.message.chat.id}&text=${encodeURI(reply)}`)
        if(gif) {
            const gif = await axios.get(`https://g.tenor.com/v1/random?key=${process.env.TENOR_KEY}&q=${encodeURI(gif)}&limit=1`);
            await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendAnimation?chat_id=${body.message.chat.id}&animation=${encodeURI(gif.data.results[0].media[0].gif.url)}`)
        }
    } catch (e) {
        console.error('Error sending message', e);
        await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${body.message.chat.id}&text=${encodeURI('Problems with the server !')}`)
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify('OK')
    };
    callback(null, response);

};

