# Start from scratch starter project

This project contains source code and supporting files for the serverless application that you created in the AWS Lambda console. You can update your application at any time by committing and pushing changes to your AWS CodeCommit or GitHub repository.

This project includes the following files and folders:

- src - Code for the application's Lambda function.
- \_\_tests__ - Unit tests for the application code.
- cdk - The CDK model that defines the application's AWS resources.
- buildspec.yml -  A build specification file that tells AWS CodeBuild how to create a deployment package for the function.

Your Lambda application includes two AWS CloudFormation stacks. The first stack creates the pipeline that builds and deploys your application.

The pipeline creates a second stack that contains your application's resources, including Lambda functions. These resources are defined in the `cdk/lib/cdk-stack.ts` file in this project. You can update the CDK model to add AWS resources through the same deployment process that updates your application code. You can view those resources in the **Resources** section of the application overview in the Lambda console.

For a full list of possible operations, see the [AWS Lambda Applications documentation](https://docs.aws.amazon.com/lambda/latest/dg/deploying-lambda-apps.html).

## Try the application out

1. Go to the Lambda console.
2. Select **Applications** and select the one you created.
3. Select **helloFromLambda** in the **Resources** table.
4. Create a test event with the default settings. (Select **Select a test event** -> select **Configure test events** -> type in **Event name** -> select **Create**)
5. Select **Test** and you can see the result.

## Add a resource to your application

The application template uses the AWS Cloud Development Kit (AWS CDK) to define application resources. AWS CDK is an open source software development framework that you can use to model and provision your cloud application resources using familiar programming languages. It provides a library of high-level constructs that simplify resource creation, and an interface for working with CloudFormation resource types directly when needed. When you build an AWS CDK project, the output is a CloudFormation template that defines your application.

The application's resources are defined in `cdk/lib/cdk-stack.ts`. To add a destination to your application, import the `aws-cdk-lib/aws-sqs` module and define a `Queue` resource in the class constructor.

**cdk/lib/cdk-stack.ts**
```typescript
import * as sqs from 'aws-cdk-lib/aws-sqs';
...

export class CdkStack extends Stack {
    constructor(scope: App, id: string, props: StackProps) {
        ...
        // Lambda destination
        const destination = new sqs.Queue(this, 'DestinationQueue');
        ...
```

The destination is a location for Lambda to send events that could not be processed. It's only used if you invoke your function asynchronously, but it's useful here to show how you can modify your application's resources and function configuration.

Commit the change and push.

```bash
my-application$ git commit -am "Add destination queue."
my-application$ git push
```

**To see how the pipeline processes and deploys the change**

1. Open the [Applications](https://console.aws.amazon.com/lambda/home#/applications) page.
1. Choose your application.
1. Choose **Deployments**.

When the deployment is complete, view the application resources on the **Overview** tab to see the new resource.

## Update the permissions boundary

The sample application applies a **permissions boundary** to its function's execution role. The permissions boundary limits the permissions that you can add to the function's role. Without the boundary, users with write access to the project repository could modify the project template to give the function permission to access resources and services outside of the scope of the sample application.

In order for the function to use the queue that you added in the previous step, you must extend the permissions boundary. The Lambda console detects resources that aren't in the permissions boundary and provides an updated policy that you can use to update it.

**To update the application's permissions boundary**

1. Open the [Applications](https://console.aws.amazon.com/lambda/home#/applications) page.
1. Choose your application.
1. Choose **Edit permissions boundary**.
1. Follow the instructions shown to update the boundary to allow access to the new queue.

## Update the function configuration

Now you can grant the function permission to access the queue and configure the destinations setting.

In the function's properties in `cdk/lib/cdk-stack.ts`, import the `aws-cdk-lib/aws-lambda-destinations` module and add an `SqsDestination` resource to the **onFailure** destinations configuration.

```typescript
import { SqsDestination } from 'aws-cdk-lib/aws-lambda-destinations';
...

export class CdkStack extends Stack {
    constructor(scope: App, id: string, props: StackProps) {
        ...
        // This is a Lambda function config associated with the source code: hello-from-lambda.js
        new lambda.Function(this, 'helloFromLambda', {
            ...
            onFailure: new SqsDestination(destination),
        });
        ...
```

Commit and push the change. When the deployment is complete, view the function in the console to see the updated configuration that specifies the destination.

## Build and test locally

The AWS SAM command line interface (CLI) is an extension of the AWS CLI that adds functionality for building and testing Lambda applications. It uses Docker to run your functions in an Amazon Linux environment that matches Lambda. It can also emulate your application's build environment and API.

If you prefer to use an integrated development environment (IDE) to build and test your application, you can use the AWS Toolkit.
The AWS Toolkit is an open-source plugin for popular IDEs that uses the AWS SAM CLI to build and deploy serverless applications on AWS. The AWS Toolkit also adds step-through debugging for Lambda function code.

To get started, see the following:

* [PyCharm](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [IntelliJ](https://docs.aws.amazon.com/toolkit-for-jetbrains/latest/userguide/welcome.html)
* [VS Code](https://docs.aws.amazon.com/toolkit-for-vscode/latest/userguide/welcome.html)
* [Visual Studio](https://docs.aws.amazon.com/toolkit-for-visual-studio/latest/user-guide/welcome.html)

To use the AWS SAM CLI with this sample, you need the following tools:

* AWS CLI - [Install the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) and [configure it with your AWS credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html).
* AWS SAM CLI - [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).
* Docker - [Install Docker community edition](https://hub.docker.com/search/?type=edition&offering=community).

Compile your AWS CDK app and create a AWS CloudFormation template

```bash
my-application$ cd cdk
cdk$ export S3_BUCKET=mockBucket
cdk$ cdk synth --no-staging > ../template.yaml
```

Find the logical ID for your Lambda function in `template.yaml`. It will look like *helloFromLambda12345678*, where *12345678* represents an 8-character unique ID that the AWS CDK generates for all resources. The line right after it should look like `Type: AWS::Lambda::Function`.

Test a single function by invoking it directly with a test event. An event is a JSON document that represents the input that the function receives from the event source. Test events are included in the `events` folder in this project.

Although functions in `template.yaml` are specified to have deployment package in S3, AWS SAM CLI assumes the source code is in the same local directory as `template.yaml`.

Run functions locally and invoke them with the `sam local invoke` command.

```bash
my-application$ sam local invoke helloFromLambda12345678 --no-event
```

## Unit tests

Requirements:

* Node.js - [Install Node.js 18.x](https://nodejs.org/en/), including the npm package management tool.

Tests are defined in the \_\_tests__ folder in this project. Use `npm` to install the [Jest test framework](https://jestjs.io/) and run unit tests.

```bash
my-application$ npm install
my-application$ npm run test
```

## Resources

For an introduction to the AWS CDK specification, see the [AWS CDK Developer Guide](https://docs.aws.amazon.com/cdk/latest/guide/home.html).

Next, you can use the AWS Serverless Application Repository to deploy ready-to-use apps that go beyond Hello World samples and learn how authors developed their applications. For more information, see the [AWS Serverless Application Repository main page](https://aws.amazon.com/serverless/serverlessrepo/) and the [AWS Serverless Application Repository Developer Guide](https://docs.aws.amazon.com/serverlessrepo/latest/devguide/what-is-serverlessrepo.html).
