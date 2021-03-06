/* eslint-disable no-console */
import { format } from 'date-fns';
import { Page, HTTPResponse, ElementHandle } from 'puppeteer-core';
import ENVIRONMENTS from '../utils/env';

const BILLING_HOME_URL = 'https://console.aws.amazon.com/billing/home#/';
const billingScrShotPath = `/tmp/aws-billing.${format(
  new Date(),
  'yyyyMMdd',
)}.png`;
const billingRateSelector =
  'div[data-testid="aws-billing-dashboard-spendsummary-exchange-rate"';

const loginAws = async (page: Page): Promise<HTTPResponse | null> => {
  await page.goto(
    `https://${ENVIRONMENTS.EXCHANGE_RATE_SCRAPING_ACCOUNT_ID}.signin.aws.amazon.com/console`,
    { waitUntil: 'domcontentloaded' },
  );
  await page.waitForSelector('#signin_form').catch((err) => {
    console.error('AWSのサインイン画面へ到達できませんでした。');
    console.error(err);
  });
  await page.type('#username', ENVIRONMENTS.EXCHANGE_RATE_SCRAPING_USERNAME);
  await page.type('#password', ENVIRONMENTS.EXCHANGE_RATE_SCRAPING_PASSWORD);
  await page.click('#signin_button').catch((err) => {
    console.error('AWSのサインインボタンをクリックできませんでした。');
    console.error(err);
  });

  return page.waitForNavigation();
};

const moveToBillingHome = async (
  page: Page,
): Promise<ElementHandle<Element> | null> => {
  await page.goto(BILLING_HOME_URL, {
    waitUntil: 'domcontentloaded',
  });

  return page.waitForSelector(billingRateSelector);
};

const fetchExchangeRate = async (page: Page): Promise<number> => {
  const rate = await page.$eval(
    billingRateSelector,
    (el) => el.lastChild?.textContent,
  );

  return rate ? parseFloat(rate) : -1;
};

const fetchMonthSum = async (page: Page): Promise<number> => {
  const selector =
    'div[data-testid="aws-billing-dashboard-spendsummary-total-fx"';
  const sum = await page.$eval(selector, (el) => el.firstChild?.textContent);

  return sum ? parseFloat(sum) : -1;
};

const takeScrShot = async (page: Page): Promise<string | void | Buffer> => {
  const elementRect = await page.$eval(
    'div[data-testid="spend-by-service-container-widget"]',
    (el) => {
      const rect = el.getBoundingClientRect();

      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      };
    },
  );

  return page.screenshot({
    path: billingScrShotPath,
    clip: elementRect,
  });
};

export {
  loginAws,
  fetchExchangeRate,
  fetchMonthSum,
  takeScrShot,
  billingScrShotPath,
  moveToBillingHome,
};
