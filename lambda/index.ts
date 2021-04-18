import chromium from "chrome-aws-lambda";
import { loginAws, fetchExchangeRate, fetchMonthSum } from "./domains/aws";
import BROWSER_OPTIONS from "./utils/puppeteer";
import webhook from "./domains/discord";
import { MessageBuilder } from "discord-webhook-node";
import round from "./utils/date";

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
    .setDescription(`${new Date().getFullYear()}/${new Date().getMonth() + 1}における現時点での請求額通知です。`)
    .addField("今月の請求(JPY)", round(monthlySum, 100).toString(), true)
    .addField("為替レート(JPY)", round(rate, 100).toString(), true);
  await webhook.send(embed);

  return {
    rate,
    monthlySum,
  };
};
