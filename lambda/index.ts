import chromium from "chrome-aws-lambda";
import { loginAws, fetchExchangeRate, fetchMonthSum } from "./domains/aws";
import BROWSER_OPTIONS from "./utils/puppeteer";

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

  return {
    rate,
    monthlySum
  };
};
