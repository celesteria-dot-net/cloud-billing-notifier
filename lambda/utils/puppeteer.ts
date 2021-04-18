const BROWSER_OPTIONS = {
  headless: true,
  defaultViewport: { width: 1920, height: 1080 },
  args: [
    '--single-process',
    '--disable-gpu ',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
  ],
};

export default BROWSER_OPTIONS;
