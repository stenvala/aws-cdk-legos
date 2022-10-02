import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { PARAMETER_STORE_KEYS } from "./const";
import { Props } from "./props";
import { addToParameterStore } from "./utils";

export class SecurityGroups {
  constructor(stack: cdk.Stack, props: Props) {
    const webServerSG = new ec2.SecurityGroup(stack, "webserver-kind", {
      vpc: props.constructs.vpc!,
      allowAllOutbound: true,
      description: "Suitable for webserver",
    });

    webServerSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "Allow SSH access from anywhere"
    );

    webServerSG.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      "Allow HTTPS traffic from anywhere"
    );

    addToParameterStore(stack, {
      id: "WebServerSGPS",
      parameterName: PARAMETER_STORE_KEYS.SECURITY_GROUP.WEBSERVER.ID,
      stringValue: webServerSG.securityGroupId,
    });

    // Backend that allows connecting from webserver only
    const backendServerSG = new ec2.SecurityGroup(stack, "backend-kind", {
      vpc: props.constructs.vpc!,
      allowAllOutbound: true,
      description: "Suitable for connections taken from webServer",
    });

    backendServerSG.connections.allowFrom(
      new ec2.Connections({
        securityGroups: [webServerSG],
      }),
      ec2.Port.tcp(8000),
      "Allow traffic on port 8000 from the webserver security group"
    );

    backendServerSG.addEgressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443),
      "Allow making HTTPS requests"
    );

    addToParameterStore(stack, {
      id: "BackendServerSGPS",
      parameterName: PARAMETER_STORE_KEYS.SECURITY_GROUP.BACKEND.ID,
      stringValue: backendServerSG.securityGroupId,
    });

    // 👇 Create a SG for a database server
    const dbserverSG = new ec2.SecurityGroup(stack, "database-kind", {
      vpc: props.constructs.vpc!,
      allowAllOutbound: true,
      description: "Suitable for a database server",
    });

    dbserverSG.connections.allowFrom(
      new ec2.Connections({
        securityGroups: [backendServerSG],
      }),
      ec2.Port.tcp(3306),
      "Allow traffic on port 3306 from the backend server security group"
    );

    addToParameterStore(stack, {
      id: "DatabaseServerSGPS",
      parameterName: PARAMETER_STORE_KEYS.SECURITY_GROUP.DATABASE.ID,
      stringValue: dbserverSG.securityGroupId,
    });
  }
}
