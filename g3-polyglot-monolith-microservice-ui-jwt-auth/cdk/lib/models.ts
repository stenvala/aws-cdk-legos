import { CustomDomainNameFactory } from "./custom-domain-name.factory";

export interface GlobalProps {
  amisAuth: "api" | "lambda" | "jwt" | "demo";
  useCustomDomainName: boolean;
  customDomainNameFactory?: CustomDomainNameFactory;
  maxConcurrency: number;
}

export const DELETE_EVENT_BUS_NAME = "DeleteAttachment";
