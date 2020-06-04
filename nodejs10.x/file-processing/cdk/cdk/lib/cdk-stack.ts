import * as lambda from '@aws-cdk/aws-lambda';
import { S3EventSource } from '@aws-cdk/aws-lambda-event-sources';
import * as s3 from '@aws-cdk/aws-s3';
import { App, CfnParameter, Stack, StackProps } from '@aws-cdk/core';


export class CdkStack extends Stack {
    constructor(scope: App, id: string, props: StackProps) {
        super(scope, id, props);

        const appId = new CfnParameter(this, 'AppId');

        // The code will be uploaded to this location during the pipeline's build step
        const artifactBucket = process.env.S3_BUCKET!;
        const artifactKey = `${process.env.CODEBUILD_BUILD_ID}/function-code.zip`;

        // Create an S3 bucket, with the given name
        const bucketId = 'simpleappbucket';
        const bucket = new s3.Bucket(this, bucketId, {
            bucketName: ['aws', this.region, this.account, appId.value.toString(), bucketId].join('-'),
        });

        // This is a Lambda function config associated with the source code: s3-json-logger.js
        const s3JsonLoggerFunction = new lambda.Function(this, 's3JsonLogger', {
            description: 'A Lambda function that logs a json file sent to S3 bucket.',
            handler: 'src/handlers/s3-json-logger.s3JsonLoggerHandler',
            runtime: lambda.Runtime.NODEJS_10_X,
            code: lambda.Code.fromBucket(
                s3.Bucket.fromBucketName(this, 'ArtifactBucket', artifactBucket),
                artifactKey,
            ),
            events: [
                new S3EventSource(
                    bucket,
                    { events: [s3.EventType.OBJECT_CREATED], filters: [{ suffix: '.json' }] }
                ),
            ],
        });
        // Give Read permissions to the S3 bucket
        bucket.grantRead(s3JsonLoggerFunction);
    }
}
