import chromium from "chrome-aws-lambda";
import { loginAws, fetchExchangeRate, fetchMonthSum } from "./domains/aws";
import BROWSER_OPTIONS from "./utils/puppeteer";
import webhook from "./domains/discord";
import { MessageBuilder } from "discord-webhook-node";

export const handler = async () => {
  const browser = await chromium.puppeteer.launch({
    ...BROWSER_OPTIONS,
    executablePath: await chromium.executablePath,
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  await loginAws(page).catch((err) => {
    console.error("AWSへのログインに失敗しました。");
    console.error(err);
  });

  const rate = await fetchExchangeRate(page);
  const monthlySum = await fetchMonthSum(page);

  await browser.close();

  const embed = new MessageBuilder()
    .setAuthor("AWS Cost Information")
    .setDescription(`${new Date().getFullYear()}/${new Date().getMonth()}分の現時点での使用量通知です。`)
    .addField("今月の請求(JPY)", monthlySum.toString(), true)
    .addField("為替レート(JPY)", rate.toString(), true);
  await webhook.send(embed);

  return {
    rate,
    monthlySum,
  };
};
