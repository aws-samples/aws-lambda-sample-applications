import * as events from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import { App, CfnParameter, Stack, StackProps } from '@aws-cdk/core';


export class CdkStack extends Stack {
    constructor(scope: App, id: string, props: StackProps) {
        super(scope, id, props);

        new CfnParameter(this, 'AppId');

        // The code will be uploaded to this location during the pipeline's build step
        const artifactBucket = process.env.S3_BUCKET!;
        const artifactKey = `${process.env.CODEBUILD_BUILD_ID}/function-code.zip`;

        // This is a Lambda function config associated with the source code: scheduled-event-logger.js
        const scheduledEventLoggerFunction = new lambda.Function(this, 'scheduledEventLogger', {
            description: 'A Lambda function that logs the payload of scheduled events.',
            handler: 'src/handlers/scheduled-event-logger.scheduledEventLoggerHandler',
            runtime: lambda.Runtime.NODEJS_10_X,
            code: lambda.Code.fromBucket(
                s3.Bucket.fromBucketName(this, 'ArtifactBucket', artifactBucket),
                artifactKey,
            ),
        });

        new events.Rule(this, 'SimpleCWEEvent', {
            // Runs every hour at the top of the hour (for example, at 5:00 and then at 6:00)
            schedule: events.Schedule.expression('cron(0 * * * ? *)'),
            targets: [new LambdaFunction(scheduledEventLoggerFunction)],
        });
    }
}
