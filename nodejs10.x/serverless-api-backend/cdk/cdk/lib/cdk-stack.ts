import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import { App, CfnParameter, Duration, Stack, StackProps } from '@aws-cdk/core';


export class CdkStack extends Stack {
    constructor(scope: App, id: string, props: StackProps) {
        super(scope, id, props);

        new CfnParameter(this, 'AppId');

        // DynamoDB table to store item: {id: <ID>, name: <NAME>}
        const table = new dynamodb.Table(this, 'SampleTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
            readCapacity: 2,
            writeCapacity: 2
        });

        const environment = { SAMPLE_TABLE: table.tableName };
        // The code will be uploaded to this location during the pipeline's build step
        const artifactBucket = s3.Bucket.fromBucketName(this, 'ArtifactBucket', process.env.S3_BUCKET!);
        const artifactKey = `${process.env.CODEBUILD_BUILD_ID}/function-code.zip`;
        const code = lambda.Code.fromBucket(artifactBucket, artifactKey);

        // This is a Lambda function config associated with the source code: get-all-items.js
        const getAllItemsFunction = new lambda.Function(this, 'getAllItems', {
            description: 'A simple example includes a HTTP get method to get all items from a DynamoDB table.',
            handler: 'src/handlers/get-all-items.getAllItemsHandler',
            runtime: lambda.Runtime.NODEJS_10_X,
            code,
            environment,
            timeout: Duration.seconds(60),
        });
        // Give Read permissions to the SampleTable
        table.grantReadData(getAllItemsFunction);

        // This is a Lambda function config associated with the source code: get-by-id.js
        const getByIdFunction = new lambda.Function(this, 'getById', {
            description: 'A simple example includes a HTTP get method to get one item by id from a DynamoDB table.',
            handler: 'src/handlers/get-by-id.getByIdHandler',
            runtime: lambda.Runtime.NODEJS_10_X,
            code,
            timeout: Duration.seconds(60),
            environment,
        });
        // Give Read permissions to the SampleTable
        table.grantReadData(getByIdFunction);

        // This is a Lambda function config associated with the source code: put-item.js
        const putItemFunction = new lambda.Function(this, 'putItem', {
            description: 'A simple example includes a HTTP post method to add one item to a DynamoDB table.',
            handler: 'src/handlers/put-item.putItemHandler',
            runtime: lambda.Runtime.NODEJS_10_X,
            code,
            timeout: Duration.seconds(60),
            environment,
        });
        // Give Create/Read/Update/Delete permissions to the SampleTable
        table.grantReadWriteData(putItemFunction);

        const api = new apigateway.RestApi(this, 'ServerlessRestApi', { cloudWatchRole: false });
        api.root.addMethod('GET', new apigateway.LambdaIntegration(getAllItemsFunction));
        api.root.addMethod('POST', new apigateway.LambdaIntegration(putItemFunction));
        api.root.addResource('{id}').addMethod('GET', new apigateway.LambdaIntegration(getByIdFunction));
    }
}
