const Report = require("../../utils/report");
const KGSyncTest = require("../../utils/utils");

const cafe24TestScript = async (page, url, result) => {
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

module.exports = { cafe24TestScript };
