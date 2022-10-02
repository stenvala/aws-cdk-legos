export const PARAMETER_STORE_KEYS = {
  VPC: {
    ID: "/NetworkInfra/Vpc/Id",
    SUBNETS: {
      PUBLIC_1: { ID: "/NetworkInfra/Vpc/Subnets/Public1" },
      PUBLIC_2: { ID: "/NetworkInfra/Vpc/Subnets/Public2" },
      PRIVATE_1: { ID: "/NetworkInfra/Vpc/Subnets/Private1" },
      PRIVATE_2: { ID: "/NetworkInfra/Vpc/Subnets/Private2" },
      ISOLATED_1: { ID: "/NetworkInfra/Vpc/Subnets/Isolated1" },
      ISOLATED_2: { ID: "/NetworkInfra/Vpc/Subnets/Isolated2" },
    },
  },
  SECURITY_GROUP: {
    WEBSERVER: {
      ID: "/NetworkInfra/SecurityGroup/Webserver/Id",
    },
    BACKEND: {
      ID: "/NetworkInfra/SecurityGroup/Backend/Id",
    },
    DATABASE: {
      ID: "/NetworkInfra/SecurityGroup/Database/Id",
    },
  },
};
