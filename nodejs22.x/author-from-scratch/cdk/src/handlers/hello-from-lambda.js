/**
 * A Lambda function that returns a string.
 */
exports.helloFromLambdaHandler = async () => {
    // If you change this message, you will need to adjust tests in hello-from-lambda.test.js
    const message = 'Hello from Lambda!';

    // All log statements are written to CloudWatch by default. For more information, see
    // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
    console.log(message);

    return message;
};
