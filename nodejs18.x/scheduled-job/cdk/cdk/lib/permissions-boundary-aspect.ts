import { IAspect } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { IConstruct } from 'constructs';


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
