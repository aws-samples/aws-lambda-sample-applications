// Import mock AWS SDK from aws-sdk-mock
const AWS = require('aws-sdk-mock');

describe('Test for s3-json-logger', () => {
    // This test invokes the s3-json-logger Lambda function and verifies that the received payload is logged
    it('Verifies the object is read and the payload is logged', async () => {
        const objectBody = '{"Test": "PASS"}';
        const getObjectResponse = { Body: objectBody };
        AWS.mock('S3', 'getObject', (params, callback) => {
            callback(null, getObjectResponse);
        });

        // Mock console.log statements so we can verify them. For more information, see
        // https://jestjs.io/docs/en/mock-functions.html
        console.log = jest.fn();

        // Create a sample payload with S3 message format
        const event = {
            Records: [
                {
                    s3: {
                        bucket: {
                            name: 'test-bucket',
                        },
                        object: {
                            key: 'test-key',
                        },
                    },
                },
            ],
        };

        // Import all functions from s3-json-logger.js. The imported module uses the mock AWS SDK
        const s3JsonLogger = require('../../../src/handlers/s3-json-logger.js');
        await s3JsonLogger.s3JsonLoggerHandler(event, null);

        // Verify that console.log has been called with the expected payload
        expect(console.log).toHaveBeenCalledWith(objectBody);

        AWS.restore('S3');
    });
});
