/* eslint-disable no-console */
import chromium from 'chrome-aws-lambda';
import { format } from 'date-fns';
import { MessageBuilder } from 'discord-webhook-node';
import {
  loginAws,
  fetchExchangeRate,
  fetchMonthSum,
  billingScrShotPath,
  takeScrShot,
  moveToBillingHome,
} from './domains/aws';
import webhook from './domains/discord';
import uploadImage from './domains/gyazo';
import round from './utils/number';
import BROWSER_OPTIONS from './utils/puppeteer';

// eslint-disable-next-line import/prefer-default-export
export const handler = async (): Promise<void> => {
  const browser = await chromium.puppeteer.launch({
    ...BROWSER_OPTIONS,
    executablePath: await chromium.executablePath,
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  await loginAws(page).catch((err) => {
    console.error('AWSへのログインに失敗しました。');
    console.error(err);
  });

  await moveToBillingHome(page).catch((err) => {
    console.error('AWS Billing ホーム画面に到達できませんでした。');
    console.error(err);
  });

  const rate = await fetchExchangeRate(page);
  const monthlySum = await fetchMonthSum(page);

  await takeScrShot(page).catch((err) => {
    console.error(
      'サービス別請求内訳のスクリーンショットの作成に失敗しました。',
    );
    console.error(err);
  });

  await browser.close();

  const gyazoResponse = await uploadImage(billingScrShotPath);

  const embed = new MessageBuilder()
    .setAuthor('AWS Cost Information')
    .setDescription(
      `${format(new Date(), 'yyyy/MM')}における現時点での請求額通知です。`,
    )
    .addField('今月の請求(JPY)', round(monthlySum, 100).toString(), true)
    .addField('為替レート(JPY)', round(rate, 100).toString(), true)
    .setImage(gyazoResponse.url);
  await webhook.send(embed).catch((err) => {
    console.error('DiscordにWebhookを送信できませんでした。');
    console.error(err);
  });
};
