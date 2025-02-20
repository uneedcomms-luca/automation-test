const { chromium, devices } = require("playwright");
const data = require("./data.json");
const Report = require("../utils/report");
const { Api } = require("../utils/api");
const { cafe24TestScript } = require("./cafe24/script");
const { imwebTestScript } = require("./imweb/script");

let result = [];

(async () => {
  const mobile = devices["iPhone 12 Pro"];
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ ...mobile });
  const page = await context.newPage();

  const testData = data;

  for (let idx of testData) {
    try {
      const { url, hosting } = await Api.getShopInfo(idx);

      await mapTestScript[hosting](page, url);
    } catch (e) {
      console.log(e);
    }
  }

  await browser.close();

  // 결과 저장 (json)
  result = result.length === 0 ? "SUCCESS" : result;
  Report.saveReport("cafe24", result);
  console.log("TEST END");
})();

const mapTestScript = {
  cafe24: cafe24TestScript,
  imweb: imwebTestScript,
  makeshop: imwebTestScript
};
