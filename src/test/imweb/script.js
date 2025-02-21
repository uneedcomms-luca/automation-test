const imwebTestScript = async (page, url, result) => {
  let errReport = new ErrorReport(url);
  // 1. 이동
  try {
    await page.goto("https://" + url + "/login");
    // delay 1.5s
    await page.waitForTimeout(1500);

    console.log("TEST - navigate :", url);
  } catch (e) {
    errReport.addError("navigate", e);
  }

  // 2. kgElement 확인
  try {
    const isElementPresent = (await page.$("#KG_section")) !== null;
    if (!isElementPresent) {
      errReport["kgElement"] = "KG_section not found";
    }
    console.log("TEST - kgElement :", isElementPresent);
  } catch (e) {
    errReport.addError("kgElement", e);
  }

  //  화면 캡처
  try {
    await page.screenshot({ path: `screenshot/${url}.png` });
    console.log("TEST - screenshot :", url);
  } catch (e) {
    errReport.addError("screenshot", e);
  }
  // 로그인 버튼 클릭 확인
  try {
    const kakaoLoginSelector = "#kakaoLogin > a";

    await page.waitForSelector(kakaoLoginSelector);

    await page.click(kakaoLoginSelector);
    await page.waitForLoadState("networkidle");

    const currentUrl = page.url();
    const navigationUrls = ["https://accounts.kakao.com/login/?continue", "kauth.kakao.com/oauth/authorize"];

    if (!navigationUrls.some((url) => currentUrl.includes(url))) {
      errReport["kakaoLogin"] = "kakao login failed";
    }
    console.log("TEST - kakaoLogin :", url);
  } catch (e) {
    errReport.addError("kakaoLogin", e);
  }

  if (errReport.error.length > 0) {
    result.push(errReport);
  }
};

class ErrorReport {
  constructor(url) {
    this.name = url;
    this.error = [];
  }

  addError = (type, message) => {
    this.error.push({ type, message });
  };
}

// 로그인
// 회원가입 페이지 - 캡쳐

module.exports = { imwebTestScript };
