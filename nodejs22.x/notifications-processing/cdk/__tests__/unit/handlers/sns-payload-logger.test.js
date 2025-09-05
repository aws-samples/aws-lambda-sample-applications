// Import all functions from sns-payload-logger.js
const snsPayloadLogger = require('../../../src/handlers/sns-payload-logger.js');

describe('Test for sns-payload-logger', () => {
    // This test invokes the sns-payload-logger Lambda function and verifies that the received payload is logged
    it('Verifies the payload is logged', async () => {
        // Mock console.log statements so we can verify them. For more information, see
        // https://jestjs.io/docs/en/mock-functions.html
        console.log = jest.fn();

        // Create a sample payload with SNS message format
        const payload = {
            Records: [{
                Sns: {
                    Message: 'This is a notification from SNS',
                    Subject: 'SNS Notification',
                    TopicArn: 'arn:aws:sns:us-west-2:123456789012:SimpleTopic',
                },
            }],
        };

        await snsPayloadLogger.snsPayloadLoggerHandler(payload, null);

        // Verify that console.log has been called with the expected payload
        payload.Records.forEach(({ Sns }, i) => {
            expect(console.log).toHaveBeenNthCalledWith(i + 1, JSON.stringify(Sns));
        });
    });
});
