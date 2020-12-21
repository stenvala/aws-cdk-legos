import * as iam from "@aws-cdk/aws-iam";
import * as kms from "@aws-cdk/aws-kms";
import * as cdk from "@aws-cdk/core";

export const KEY = "/auth/netcore-monolith-secret";

const PREFIX = "key-";

export class AuthParam {
  private static key_: kms.Key;
  private static policy_: iam.PolicyStatement;

  get key() {
    return AuthParam.key_;
  }

  get policy() {
    return AuthParam.policy_;
  }

  private readonly prefix: string;

  constructor(stack: cdk.Stack, prefix: string) {
    this.prefix = prefix + PREFIX;

    const policy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: [
            "kms:Create*",
            "kms:Describe*",
            "kms:Enable*",
            "kms:List*",
            "kms:Put*",
            "kms:Update*",
            "kms:Revoke*",
            "kms:Disable*",
            "kms:Get*",
            "kms:Delete*",
            "kms:TagResource",
            "kms:UntagResource",
            "kms:ScheduleKeyDeletion",
            "kms:CancelKeyDeletion",
            "kms:Encrypt",
            "kms:Decrypt",
            "kms:ReEncrypt*",
            "kms:GenerateDataKey*",
            "kms:DescribeKey",
            "kms:CreateGrant",
            "kms:ListGrants",
            "kms:RevokeGrant",
          ],
          principals: [new iam.AccountRootPrincipal()],
          resources: ["*"],
        }),
      ],
    });

    AuthParam.key_ = new kms.Key(stack, this.prefix + "key", {
      trustAccountIdentities: true,
      policy,
    });
  }

  static grantRead(grantee: iam.IGrantable) {
    AuthParam.key_.grantDecrypt(grantee);
  }

  static grantWrite(grantee: iam.IGrantable) {
    AuthParam.key_.grantEncryptDecrypt(grantee);
  }
}
