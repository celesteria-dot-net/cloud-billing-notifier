import { Rule, Schedule } from '@aws-cdk/aws-events';
import { LambdaFunction } from '@aws-cdk/aws-events-targets';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import { Duration } from '@aws-cdk/core';
import ENVIRONMENTS from '../lambda/utils/env';
import { NODE_LAMBDA_LAYER_DIR } from './process/setup';

// eslint-disable-next-line import/prefer-default-export
export class CloudBillingNotifierStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const nodeModulesLayer = new lambda.LayerVersion(this, 'ChromeWithLamda', {
      description:
        'このレイヤーはchrome-aws-lambdaほかcloud-billing-notifierリポジトリに必要な依存関係パッケージが含まれています。',
      code: lambda.AssetCode.fromAsset(NODE_LAMBDA_LAYER_DIR),
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
    });

    const awsBilling = new lambda.Function(this, 'aws-billing', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('out/lambda'),
      handler: 'index.handler',
      environment: {
        EXCHANGE_RATE_SCRAPING_ACCOUNT_ID:
          ENVIRONMENTS.EXCHANGE_RATE_SCRAPING_ACCOUNT_ID,
        EXCHANGE_RATE_SCRAPING_USERNAME:
          ENVIRONMENTS.EXCHANGE_RATE_SCRAPING_USERNAME,
        EXCHANGE_RATE_SCRAPING_PASSWORD:
          ENVIRONMENTS.EXCHANGE_RATE_SCRAPING_PASSWORD,
        DISCORD_WEBHOOK: ENVIRONMENTS.DISCORD_WEBHOOK,
        GYAZO_TOKEN: ENVIRONMENTS.GYAZO_TOKEN,
      },
      timeout: Duration.minutes(1),
      memorySize: 1024,
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
