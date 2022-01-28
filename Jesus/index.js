const axios = require('axios');
const { processMessage } = require('./processMessage');
const { get, upsert } = require('./db');

async function addMembers(chatId, message) {
    const newChatMembers = message.new_chat_members;
    const group = await get(Math.abs(chatId).toString()) ??
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

    await upsert(Math.abs(chatId).toString(), { people: group });
}

exports.handler = async (event) => {

    const body = JSON.parse(event.body);

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

    const group = await get(Math.abs(body.message.chat.id).toString());

    if(!group) {
        return {
            statusCode: 200,
            body: JSON.stringify('No group found')
        }
    }

    const processedMessage = processMessage(body.message, group.people);

    if(!processedMessage) {
        return {
            statusCode: 200,
            body: JSON.stringify('Nothing to do')
        }
    }

    if(processedMessage?.peopleRecord){
        await upsert(Math.abs(body.message.chat.id).toString(), {people: processedMessage.peopleRecord});
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

