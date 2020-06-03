// Create clients outside of the handler

// Create a client to read objects from S3
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

/**
  * A Lambda function that logs the payload received from S3.
  */
exports.s3JsonLoggerHandler = async (event, context) => {
    const getObjectRequests = event.Records.map(async (record) => {
        const params = {
            Bucket: record.s3.bucket.name,
            Key: record.s3.object.key,
        };
        try {
            const { Body } = await s3.getObject(params).promise();
            // All log statements are written to CloudWatch by default. For more information, see
            // https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-logging.html
            console.log(Body.toString());
        } catch (error) {
            console.error('Error calling S3 getObject:', error);
            throw error;
        }
    });

    await Promise.all(getObjectRequests);
};
