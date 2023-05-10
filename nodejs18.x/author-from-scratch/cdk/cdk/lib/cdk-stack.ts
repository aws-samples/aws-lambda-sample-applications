import { App, CfnParameter, Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';


export class CdkStack extends Stack {
    constructor(scope: App, id: string, props: StackProps) {
        super(scope, id, props);

        new CfnParameter(this, 'AppId');

        // The code will be uploaded to this location during the pipeline's build step
        const artifactBucket = process.env.S3_BUCKET!;
        const artifactKey = `${process.env.CODEBUILD_BUILD_ID}/function-code.zip`;

        // This is a Lambda function config associated with the source code: hello-from-lambda.js
        new lambda.Function(this, 'helloFromLambda', {
            description: 'A Lambda function that returns a string.',
            handler: 'src/handlers/hello-from-lambda.helloFromLambdaHandler',
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromBucket(
                s3.Bucket.fromBucketName(this, 'ArtifactBucket', artifactBucket),
                artifactKey,
            ),
        });
    }
}
