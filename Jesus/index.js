exports.handler = (event, context, callback) => {

    console.log(event.body);

    const response = {
        statusCode: 200,
        body: JSON.stringify('This is a test Lambda function deployed using SAM Template!')

    };

    callback(null, response);

};