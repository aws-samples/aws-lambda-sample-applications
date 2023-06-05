#!/usr/bin/env node
import { App, Aspects, Aws } from 'aws-cdk-lib';

import { CdkStack } from '../lib/cdk-stack';
import { PermissionsBoundaryAspect } from '../lib/permissions-boundary-aspect';


const stack = new CdkStack(new App(), 'CdkStack', { description: 'Start from scratch starter project' });
const { ACCOUNT_ID, PARTITION, REGION, STACK_NAME } = Aws;
const permissionBoundaryArn = `arn:${PARTITION}:iam::${ACCOUNT_ID}:policy/${STACK_NAME}-${REGION}-PermissionsBoundary`;

// Apply permissions boundary to the stack
Aspects.of(stack).add(new PermissionsBoundaryAspect(permissionBoundaryArn));
