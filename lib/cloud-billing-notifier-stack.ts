import * as cdk from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import { Duration } from "@aws-cdk/core";
import { Rule, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import { NODE_LAMBDA_LAYER_DIR } from "./process/setup";
import ENVIRONMENTS from "../lambda/utils/env";

export class CloudBillingNotifierStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const nodeModulesLayer = new lambda.LayerVersion(this, "NodeModulesLayer", {
      code: lambda.AssetCode.fromAsset(NODE_LAMBDA_LAYER_DIR),
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
    });

    const awsBilling = new lambda.Function(this, "aws-billing", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset("out/lambda"),
      handler: "index.handler",
      environment: {
        EXCHANGE_RATE_SCRAPING_ACCOUNT_ID:
          ENVIRONMENTS.EXCHANGE_RATE_SCRAPING_ACCOUNT_ID,
        EXCHANGE_RATE_SCRAPING_USERNAME:
          ENVIRONMENTS.EXCHANGE_RATE_SCRAPING_USERNAME,
        EXCHANGE_RATE_SCRAPING_PASSWORD:
          ENVIRONMENTS.EXCHANGE_RATE_SCRAPING_PASSWORD,
        DISCORD_WEBHOOK: ENVIRONMENTS.DISCORD_WEBHOOK,
      },
      timeout: Duration.minutes(1),
      memorySize: 512,
      layers: [nodeModulesLayer],
    });

    new Rule(this, 'aws-billing-schedule', {
      schedule: Schedule.cron({
        minute: '0',
        hour: '0',
      }),
    }).addTarget(new LambdaFunction(awsBilling));
  }
}
