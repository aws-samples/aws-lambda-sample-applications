import { App, CfnParameter, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sqs from 'aws-cdk-lib/aws-sqs';


export class CdkStack extends Stack {
    constructor(scope: App, id: string, props: StackProps) {
        super(scope, id, props);

        new CfnParameter(this, 'AppId');

        // The code will be uploaded to this location during the pipeline's build step
        const artifactBucket = process.env.S3_BUCKET!;
        const artifactKey = `${process.env.CODEBUILD_BUILD_ID}/function-code.zip`;

        // This is an SQS queue with server-side encryption enabled, and default configuration properties
        // otherwise. To learn more about the available options, see
        // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sqs-queues.html
        const queue = new sqs.Queue(this, 'SimpleQueue', {
            encryption: sqs.QueueEncryption.KMS_MANAGED,
        });

        // This is a Lambda function config associated with the source code: sqs-payload-logger.js
        new lambda.Function(this, 'sqsPayloadLogger', {
            description: 'A Lambda function that logs the payload of messages sent to an associated SQS queue.',
            handler: 'src/handlers/sqs-payload-logger.sqsPayloadLoggerHandler',
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromBucket(
                s3.Bucket.fromBucketName(this, 'ArtifactBucket', artifactBucket),
                artifactKey,
            ),
            timeout: Duration.seconds(25), // Chosen to be less than the default SQS Visibility Timeout of 30 seconds
            events: [new SqsEventSource(queue)],
        });
    }
}
