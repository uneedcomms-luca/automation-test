const { chromium, devices } = require("playwright");
const data = require("./data.json");
const Report = require("../../utils/report");
const KGSyncTest = require("../../utils/utils");

let result = [];

(async () => {
  const mobile = devices["iPhone 12 Pro"];
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    ...mobile
  });
  const page = await context.newPage();

  for (let url of data) {
    try {
      await testScript(page, url);
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

const testScript = async (page, url) => {
  // 1. 이동
  const report = new Report(url);

  const test = new KGSyncTest({
    hosting: "cafe24",
    report,
    url,
    page
  });

  // TEST BUILD
  test.setTestParams(true, true);
  {
    await test.navigate("/member/login.html");
    await test.isKeepgrowElementPresent("login");

    await test.isKGScriptIncluded();

    await test.screenshot("login");

    // 로그인 버튼 클릭 확인
    await test.checkNextPageIsKakaoLogin();
  }
  {
    await test.navigate("/member/agreement.html");
    await test.isKeepgrowElementPresent("signup");

    await test.isKGScriptIncluded();

    await test.screenshot("signup");

    // 로그인 버튼 클릭 확인
    await test.checkNextPageIsKakaoLogin();
  }

  if (report.error.length > 0) {
    result.push(report);
  }
};
