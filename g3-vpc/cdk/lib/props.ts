import * as ec2 from "aws-cdk-lib/aws-ec2";

export interface Props {
  constructs: {
    vpc?: ec2.Vpc;
  };
}
