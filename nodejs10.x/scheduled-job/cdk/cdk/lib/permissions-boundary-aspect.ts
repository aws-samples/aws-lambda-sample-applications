import * as iam from '@aws-cdk/aws-iam';
import { IAspect, IConstruct } from '@aws-cdk/core';


export class PermissionsBoundaryAspect implements IAspect {
    private readonly arn: string;

    constructor(permissionBoundaryArn: string) {
        this.arn = permissionBoundaryArn;
    }

    public visit(node: IConstruct): void {
        if (node instanceof iam.Role) {
            const roleResource = node.node.findChild('Resource') as iam.CfnRole;
            roleResource.addPropertyOverride('PermissionsBoundary', this.arn);
        }
    }
}
