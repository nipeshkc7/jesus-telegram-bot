const axios = require('axios');

exports.handler = async (event, context, callback) => {

    const body = JSON.parse(event.body);
    const reply = processMessage(body.message);

    try {
        await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage?chat_id=${body.message.chat.id}&text=${encodeURI(reply.text)}`)
        const gif = await axios.get(`https://g.tenor.com/v1/random?key=${process.env.TENOR_KEY}&q=${encodeURI(reply.gif)}&limit=1`);
        await axios.get(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendAnimation?chat_id=${body.message.chat.id}&animation=${encodeURI(gif.data.results[0].media[0].gif.url)}`)
    } catch (e) {
        console.error('Error sending message', e);
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify('OK')
    };

    callback(null, response);

};

function processMessage(message) {
    // get amount
    switch (message.text.toLowerCase()) {
        case 'oi':
            return {
                text: `aah k vo ${message.from.first_name}`,
                gif: "what's up"
            };
        case 'k cha':
            return {
                text: `aah thikai cha ${message.from.first_name}, timro k cha`,
                gif: "how are you doing"
            };
        case 'thikai cha':
            return {
                text: `lala`,
                gif: "whatever"
            };
        default:
            return {
                text: `k vanya bujina`,
                gif: "confused"
            };
    }
}

