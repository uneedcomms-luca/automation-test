const Report = require("./report");

class KGSyncTest {
  hosting;
  report;
  url;
  page;
  testParams; // { init :boolean, default:boolean}

  constructor({ hosting, report, url, page }) {
    this.hosting = hosting;
    this.report = report;
    this.url = url;
    this.page = page;
    this.testParams = { init: false, default: false };
  }

  /**
   *
   * @param {boolean} initParam
   * @param {boolean} defaultParam
   */
  setTestParams = (initParam, defaultParam) => {
    this.testParams = { init: initParam, default: defaultParam };
  };

  navigate = async (location) => {
    let targetUrl = "https://" + this.url + location;

    if (this.testParams.init) {
      targetUrl += "?kg-kakaosync-init=test";
      if (this.testParams.default) {
        targetUrl += "&kg-kakaosync-default=test";
      }
    } else {
      if (this.testParams.default) {
        targetUrl += "?kg-kakaosync-default=test";
      }
    }
    try {
      await this.page.goto(targetUrl);
      await this.page.waitForTimeout(500);
      this.report.log("navigate");
    } catch (e) {
      this.report.addError("navigate", e);
    }
  };

  isKGScriptIncluded = async () => {
    try {
      const targetScripts = [];
      if (this.testParams.init) {
        targetScripts.push(`//storage.keepgrow.com/admin/kakaosync/test/kg_kakaoSync_init_${this.hosting}.js`);
      }
      if (this.testParams.default) {
        targetScripts.push(`//files.smartskin.co.kr/kakaoSync/${this.hosting}/`);
      }

      //files.smartskin.co.kr/kakaoSync/cafe24/mobile/kg_kakaoSync_mobile.js

      const inCludescripts = await this.page.evaluate((targetScripts) => {
        return targetScripts.every((scriptName) => {
          const res = Array.from(document.querySelectorAll("script[src]"))
            .map((script) => script.src) // src 속성 값 추출
            .filter((src) => src.includes(scriptName));
          return res.length > 0;
        });
      }, targetScripts);

      if (!inCludescripts) {
        this.report.addError("scriptName", "No matching scripts found.");
      }
    } catch (e) {
      this.report.addError("scriptName", e);
    }
  };
  isKGScriptIncluded2 = async () => {
    try {
      const targetScripts = [`storage.keepgrow.com/admin/keepgrow-service`];

      //files.smartskin.co.kr/kakaoSync/cafe24/mobile/kg_kakaoSync_mobile.js

      const inCludescripts = await this.page.evaluate((targetScripts) => {
        return targetScripts.every((scriptName) => {
          const res = Array.from(document.querySelectorAll("script[src]"))
            .map((script) => script.src) // src 속성 값 추출
            .filter((src) => src.includes(scriptName));
          return res.length > 0;
        });
      }, targetScripts);

      if (!inCludescripts) {
        this.report.addError("scriptName", "No matching scripts found.");
      }
    } catch (e) {
      console.log("🔴", "no script in", this.url);
      this.report.addError("scriptName", e);
    }
  };

  isKeepgrowElementPresent = async (type) => {
    try {
      const isElementPresent = (await this.page.$("#KG_section")) !== null;
      if (!isElementPresent) {
        if (this.hosting === "cafe24" && type === "signup") {
          await this.page.goto("https://" + this.url + "/member/join.html");
          await this.page.waitForTimeout(500);
        } else {
          this.report.addError("kgElement", "No matching elements found.");
        }
      }
      this.report.log("kgElement");
    } catch (e) {
      console.log("🔴", "no KGElement in", type);
      this.report.addError("kgElement", e);
    }
  };

  screenshot = async (path) => {
    try {
      await this.page.screenshot({ path: Report.getScreenShotPath(this.hosting, this.url, path) });
      this.report.log(path + "screenshot");
    } catch (e) {
      this.report.addError("screenshot", e);
    }
  };

  checkNextPageIsKakaoLogin = async () => {
    const successUrls = ["https://accounts.kakao.com/login/"];
    let kakaoLoginSelector = "#kakaoLogin > div > a.btn.btnKakao";

    if (this.hosting === "cafe24") {
      kakaoLoginSelector = "#kakaoLogin > div > a.btn.btnKakao";
    }
    if (this.hosting === "imweb") {
      kakaoLoginSelector = "#kakaoLogin > a";
    }

    try {
      // await this.page.waitForSelector(kakaoLoginSelector);

      await this.page.click(kakaoLoginSelector);
      await this.page.waitForLoadState("networkidle");

      const currentUrl = this.page.url();

      this.report.log("kakaoLogin");
      if (!successUrls.some((url) => currentUrl.includes(url))) {
        this.report.addError("kakaoLogin", "kakao login failed");
      }
    } catch (e) {
      this.report.addError("kakaoLogin", e);
    }
  };
}

module.exports = KGSyncTest;
