import { load } from "ts-dotenv";

const ENVIRONMENTS = load({
  EXCHANGE_RATE_SCRAPING_ACCOUNT_ID: String,
  EXCHANGE_RATE_SCRAPING_USERNAME: String,
  EXCHANGE_RATE_SCRAPING_PASSWORD: String,
  DISCORD_WEBHOOK: String,
  GYAZO_TOKEN: String,
});

export default ENVIRONMENTS;
