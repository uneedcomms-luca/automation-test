import { ReportData } from "./report";
import { ServiceGroup } from "./types/serviceGroup";

export class SyncTest {
  serviceGroup: ServiceGroup;
  reportData: ReportData;
  page: any;
  type?: "login" | "signup";

  testParams: { init: boolean; default: boolean } = { init: false, default: false };

  constructor({ serviceGroup, testPage }: { serviceGroup: ServiceGroup; testPage: any }) {
    this.serviceGroup = serviceGroup;
    this.reportData = new ReportData(serviceGroup);
    this.page = testPage;
  }

  setTestParams = (initParam: boolean, defaultParam: boolean) => {
    this.testParams = { init: initParam, default: defaultParam };
  };
  setTestType = (type: "login" | "signup") => {
    this.type = type;
    this.reportData.setTestPage(type);
  };

  // 이동
  navigate = async (location: string) => {
    this.reportData.log("navigate");

    let targetUrl = "https://" + this.serviceGroup.KGJS_domain + location;

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
      return true;
    } catch (e) {
      this.reportData.addError("navigate", e);
    }
  };

  // 스크립트 삽입 확인
  isKGScriptIncluded = async () => {
    // const hosting = this.serviceGroup.vendorKey?.toLowerCase();
    try {
      const targetScripts = [`//storage.keepgrow.com/admin/keepgrow-service/keepgrow-service`];
      //files.smartskin.co.kr/kakaoSync/cafe24/mobile/kg_kakaoSync_mobile.js

      const inCludescripts = await this.page.evaluate((targetScripts: string[]) => {
        return targetScripts.every((scriptName: string) => {
          const res = Array.from(document.querySelectorAll("script[src]"))
            .map((script) => (script as HTMLScriptElement).src) // src 속성 값 추출
            .filter((src) => src.includes(scriptName));
          return res.length > 0;
        });
      }, targetScripts);

      if (!inCludescripts) {
        this.reportData.addError("service script", "service 스크립트 미삽입");
        return;
      }
      return true;
    } catch (e) {
      this.reportData.addError("service script", e);
    }
  };

  // init 스크립트 확인 -> 없으면 inactive 상태
  isInitScriptIncluded = async () => {
    const hosting = this.serviceGroup.vendorKey?.toLowerCase();
    try {
      const targetScripts = [
        "//storage.keepgrow.com/admin/kakaosync/kg_kakaosync_",
        `//storage.keepgrow.com/admin/kakaosync/${hosting}/kg_kakaosync`
      ];

      const inCludescripts = await this.page.evaluate((targetScripts: string[]) => {
        return targetScripts.some((scriptName: string) => {
          const res = Array.from(document.querySelectorAll("script[src]"))
            .map((script) => (script as HTMLScriptElement).src) // src 속성 값 추출
            .filter((src) => src.includes(scriptName));
          return res.length > 0;
        });
      }, targetScripts);

      if (!inCludescripts) {
        this.reportData.addError("init Script", "init 스크립트 미삽입 - inactive");
        return;
      }
      return true;
    } catch (e) {
      this.reportData.addError("init Script", e);
    }
  };

  isKeepgrowElementPresentNoReport = async (testType: string) => {
    this.reportData.log("kgElement no report");
    try {
      const isElementPresent = (await this.page.$("#KG_section")) !== null;
      if (isElementPresent) return true;
    } catch (e) {
      this.reportData.addError("kgElement", e);
    }
  };
  isKeepgrowElementPresent = async (testType: string) => {
    this.reportData.log("kgElement");
    try {
      const isElementPresent = (await this.page.$("#KG_section")) !== null;
      if (isElementPresent) return true;
      this.reportData.addError("kgElement", "No matching elements found.");
    } catch (e) {
      console.log("🔴", "no KGElement in", testType);
      this.reportData.addError("kgElement", e);
    }
  };

  isTestScriptIncluded = async () => {
    const hosting = this.serviceGroup.vendorKey?.toLowerCase();
    try {
      const targetScripts: string[] = [];
      if (this.testParams.init) {
        targetScripts.push(`//storage.keepgrow.com/admin/kakaosync/test/kg_kakaoSync_init_${hosting}.js`);
      }
      if (this.testParams.default) {
        targetScripts.push(`//files.smartskin.co.kr/kakaoSync/${hosting}/`);
      }

      //files.smartskin.co.kr/kakaoSync/cafe24/mobile/kg_kakaoSync_mobile.js

      const inCludescripts = await this.page.evaluate((targetScripts: string[]) => {
        return targetScripts.every((scriptName: string) => {
          const res = Array.from(document.querySelectorAll("script[src]"))
            .map((script) => (script as HTMLScriptElement).src) // src 속성 값 추출
            .filter((src) => src.includes(scriptName));
          return res.length > 0;
        });
      }, targetScripts);

      if (!inCludescripts) {
        this.reportData.addError("scriptName", "No matching scripts found.");
      }
    } catch (e) {
      this.reportData.addError("scriptName", e);
    }
  };

  screenshot = async () => {
    try {
      this.reportData.log(this.type + "-screenshot");
      await this.page.screenshot({ path: this.reportData.getScreenShotPath() });
    } catch (e) {
      this.reportData.addError("screenshot", e);
    }
  };

  checkNextPageIsKakaoLogin = async () => {
    try {
      this.reportData.log("kakaoLogin");

      const successUrls = [
        "https://accounts.kakao.com/login/",
        "kauth.kakao.com/oauth/authorize",
        "https://accounts.kakao.com/login/?continue"
      ];
      let kakaoLoginSelector = "#kakaoLogin > div > a.btn.btnKakao";

      kakaoLoginSelector = "#kakaoLogin > a";

      if (this.serviceGroup.vendorKey === "CAFE24") {
        kakaoLoginSelector = "#kakaoLogin > div > a.btn.btnKakao";
      }

      // await this.page.waitForSelector(kakaoLoginSelector);

      await this.page.click(kakaoLoginSelector);
      await this.page.waitForLoadState("networkidle");

      const currentUrl = this.page.url();

      if (!successUrls.some((url) => currentUrl.includes(url))) {
        this.reportData.addError("kakaoLogin", "kakao login failed");
      }
    } catch (e) {
      this.reportData.addError("kakaoLogin", e);
    }
  };
}
