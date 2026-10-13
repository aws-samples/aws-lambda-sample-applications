## CI/CD toolchain for Serverless Applications

A continuous delivery pipeline to deploy serverless applications created in the AWS Lambda console. With continuous delivery, every change that you push to your source control repository triggers a pipeline that builds and deploys your application automatically. The Lambda console provides examples for common application types with sample code and templates that create supporting resources. 

To get started, go to the [AWS Lambda console](https://us-east-1.console.aws.amazon.com/lambda/home?region=us-east-1#/create/application). For more information, see [the documentation](https://docs.aws.amazon.com/lambda/latest/dg/applications-tutorial.html).

## The toolchain template

`toolchain.yml` provisions the CI/CD pipeline for your application: a source
repository, a CodeBuild project, an artifact bucket, and a CodePipeline that
builds and deploys your application stack on every change.

The pipeline deploys your application through a dedicated IAM role,
`CloudFormationRole`. This role is intentionally scoped to the resources of a
single application, identified by its application id (`AppId`). It grants only
the permissions the application stack needs, and restricts each permission to
resources named after that `AppId`, so one application cannot read or modify the
resources of another.

## Limitation: resource naming

Because `CloudFormationRole` is scoped by resource name, an application template
that creates a Secrets Manager secret or an SSM parameter must give that resource
an explicit name matching the `AppId` prefix. Without an explicit `Name`,
CloudFormation generates a physical name the role is not permitted to create, and
the deployment fails with `AccessDenied` (and the rollback that follows also
fails, leaving the stack in `ROLLBACK_FAILED`):

- Secrets Manager secrets must be named `${AppId}-*` (for example `${AppId}-db-credentials`).
- SSM parameters must be named `/${AppId}/*` (for example `/${AppId}/config/endpoint`).

Resources without an explicit `Name` property inherit a CloudFormation-generated
name that will not match these prefixes.
