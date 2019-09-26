// Import all functions from sqs-payload-logger.js
const sqsPayloadLogger = require('../../../src/handlers/sqs-payload-logger.js');

describe('Test for sqs-payload-logger', () => {
    // This test invokes the sqs-payload-logger Lambda function and verifies that the received payload is logged
    it('Verifies the payload is logged', async () => {
        // Mock console.log statements so we can verify them. For more information, see
        // https://jestjs.io/docs/en/mock-functions.html
        console.log = jest.fn();

        // Create a sample payload with SQS message format
        const payload = {
            Records: [
                {
                    messageId: '19dd0b57-b21e-4ac1-bd88-01bbb068cb78',
                    receiptHandle: 'MessageReceiptHandle',
                    body: 'Hello from SQS!',
                    attributes: {
                        ApproximateReceiveCount: '1',
                        SentTimestamp: '1523232000000',
                        SenderId: '012345678910',
                        ApproximateFirstReceiveTimestamp: '1523232000001',
                    },
                    messageAttributes: {},
                    md5OfBody: '7b270e59b47ff90a553787216d55d91d',
                    eventSource: 'aws:sqs',
                    eventSourceARN: 'arn:aws:sqs:us-west-2:012345678910:SimpleQueue',
                    awsRegion: 'us-west-2',
                },
            ],
        };

        await sqsPayloadLogger.sqsPayloadLoggerHandler(payload, null);

        // Verify that console.log has been called with the expected payload
        payload.Records.forEach((record, i) => {
            expect(console.log).toHaveBeenNthCalledWith(i + 1, JSON.stringify(record));
        });
    });
});
