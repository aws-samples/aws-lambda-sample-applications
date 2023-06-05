import { App, CfnParameter, Stack, StackProps } from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { SnsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sns from 'aws-cdk-lib/aws-sns';


export class CdkStack extends Stack {
    constructor(scope: App, id: string, props: StackProps) {
        super(scope, id, props);

        new CfnParameter(this, 'AppId');

        // The code will be uploaded to this location during the pipeline's build step
        const artifactBucket = process.env.S3_BUCKET!;
        const artifactKey = `${process.env.CODEBUILD_BUILD_ID}/function-code.zip`;

        // This is an SNS Topic with server-side encryption enabled, and default configuration properties
        // otherwise. To learn more about the available options, see
        // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-sns-topic.html
        const topic = new sns.Topic(this, 'SimpleTopic', {
            masterKey: kms.Alias.fromAliasName(this, 'AwsSnsDefaultKey', 'alias/aws/sns'),
        });

        // This is a Lambda function config associated with the source code: sns-payload-logger.js
        new lambda.Function(this, 'snsPayloadLoggerFunction', {
            description: 'A Lambda function that logs the payload of messages sent to an associated SNS topic.',
            handler: 'src/handlers/sns-payload-logger.snsPayloadLoggerHandler',
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromBucket(
                s3.Bucket.fromBucketName(this, 'ArtifactBucket', artifactBucket),
                artifactKey,
            ),
            events: [new SnsEventSource(topic)],
        });
    }
}
