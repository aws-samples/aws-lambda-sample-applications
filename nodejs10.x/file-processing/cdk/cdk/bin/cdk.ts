#!/usr/bin/env node
import { App, Aws } from '@aws-cdk/core';

import { CdkStack } from '../lib/cdk-stack';
import { PermissionsBoundaryAspect } from '../lib/permissions-boundary-aspect';


const stack = new CdkStack(new App(), 'CdkStack', { description: 'Lambda-S3 starter project' });
const { ACCOUNT_ID, PARTITION, REGION, STACK_NAME } = Aws;
const permissionBoundaryArn = `arn:${PARTITION}:iam::${ACCOUNT_ID}:policy/${STACK_NAME}-${REGION}-PermissionsBoundary`;

// Apply permissions boundary to the stack
stack.node.applyAspect(new PermissionsBoundaryAspect(permissionBoundaryArn));
