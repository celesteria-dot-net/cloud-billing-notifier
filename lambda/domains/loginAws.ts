import chromium from "chrome-aws-lambda";
import { Page } from "puppeteer-core";
import ENVIRONMENTS from "../utils/env";

const loginAws = async (page: Page) => {
  await page.goto(
    `https://${ENVIRONMENTS.EXCHANGE_RATE_SCRAPING_ACCOUNT_ID}.signin.aws.amazon.com/console`,
    { waitUntil: "domcontentloaded" }
  );
  await page.waitForSelector("#signin_form").catch((err) => {
    console.error("AWSのサインイン画面へ到達できませんでした。");
    console.error(err);
  });
  await page.type("#username", ENVIRONMENTS.EXCHANGE_RATE_SCRAPING_USERNAME);
  await page.type("#password", ENVIRONMENTS.EXCHANGE_RATE_SCRAPING_PASSWORD);
  await page.click("#signin_button").catch((err) => {
    console.error("AWSのサインインボタンをクリックできませんでした。");
    console.error(err);
  });
  await page.waitForNavigation().catch((err) => {
    console.error("AWSのコンソール画面へ移動できませんでした。");
    console.error(err);
  });
};

const fetchRate = async (page: Page) => {
  await page.goto("https://console.aws.amazon.com/billing/home#/", {
    waitUntil: "domcontentloaded",
  });
  await page
    .waitForSelector(
      'div[data-testid="aws-billing-dashboard-spendsummary-exchange-rate"'
    )
    .catch((err) => {
      console.error("AWS Billing ホーム画面に到達できませんでした。");
      console.error(err);
    });

  const rate = await page.$eval(
    'div[data-testid="aws-billing-dashboard-spendsummary-exchange-rate"',
    (el) => el.lastChild?.textContent
  );

  return rate ? parseFloat(rate) : -1;
};

const fetchAwsExchangeRate = async (): Promise<number> => {
  const browser = await chromium.puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1920, height: 1080 },
    executablePath: await chromium.executablePath,
    args: [
      "--single-process",
      "--disable-gpu ",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  await loginAws(page).catch((err) => {
    console.error("AWSへのログインに失敗しました。");
    console.error(err);
  });

  return fetchRate(page);
};

export default fetchAwsExchangeRate;
