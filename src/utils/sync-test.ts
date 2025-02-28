import { Page } from "playwright";
import { ReportData } from "./report/reportData";
import { ServiceGroup } from "./types/serviceGroup";
import { EnvType, TestPageType } from "./types/constants";

export class SyncTest {
  serviceGroup: ServiceGroup;
  reportData: ReportData;
  playwright: any;
  page?: TestPageType;
  env?: EnvType;

  testParams: { init: boolean; default: boolean } = { init: false, default: false };

  constructor({ serviceGroup, playwright, env }: { serviceGroup: ServiceGroup; playwright: Page; env: EnvType }) {
    this.serviceGroup = serviceGroup;
    this.reportData = new ReportData(serviceGroup, env);
    this.playwright = playwright;
    this.env = env;
  }

  setTestParams = (initParam: boolean, defaultParam: boolean) => {
    this.testParams = { init: initParam, default: defaultParam };
  };

  setTestPage = (page: TestPageType) => {
    this.page = page;
    this.reportData.setTestPage(page);
  };

  // 이동
  navigate = async (location: string) => {
    this.reportData.log("navigate");

    let targetUrl = "https://" + this.serviceGroup.KGJS_domain + location;

    // if (this.testParams.init) {
    //   targetUrl += "?kg-kakaosync-init=test";
    //   if (this.testParams.default) {
    //     targetUrl += "&kg-kakaosync-default=test";
    //   }
    // } else {
    //   if (this.testParams.default) {
    //     targetUrl += "?kg-kakaosync-default=test";
    //   }
    // }
    try {
      const response = await this.playwright.goto(targetUrl);
      // 응답이 없거나 HTTP 에러 코드(400 이상)일 경우 처리
      if (!response || response.status() >= 400) {
        console.log("⛔️ 없는 도메인 혹은 접근 불가:", targetUrl);
        this.reportData.addError("navigate", `없는 도메인 또는 접근 불가`);
        return;
      }
      await this.playwright.waitForTimeout(500);

      return true;
    } catch (e: unknown | any) {
      this.reportData.addError("navigate", e?.name || e);
    }
  };

  // 스크립트 삽입 확인
  isKGScriptIncluded = async () => {
    try {
      const targetScripts = [`//storage.keepgrow.com/admin/keepgrow-service/keepgrow-service`];
      const inCludescripts = await isScriptIncluded(this.playwright, targetScripts);

      if (!inCludescripts) {
        this.reportData.addError("service script", "service 스크립트 미삽입");
        return;
      }
      return true;
    } catch (e) {
      this.reportData.addError("service script", e);
    }
  };

  isTestKGScriptIncluded = async () => {
    try {
      const targetScripts = [`//storage.keepgrow.com/admin/keepgrow-service/test/keepgrow-service`];

      const inCludescripts = await isScriptIncluded(this.playwright, targetScripts);

      if (!inCludescripts) {
        this.reportData.addError("test service script", "테스트 service 스크립트 미삽입");
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

      const inCludescripts = await isScriptIncluded(this.playwright, targetScripts);

      if (!inCludescripts) {
        this.reportData.addError("init Script", "init 스크립트 미삽입 - inactive");
        return;
      }
      return true;
    } catch (e) {
      this.reportData.addError("init Script", e);
    }
  };

  isKeepgrowElementPresentNoReport = async () => {
    this.reportData.log("kgElement no report");
    try {
      const isElementPresent = (await this.playwright.$("#KG_section")) !== null;
      if (isElementPresent) return true;
    } catch (e) {
      this.reportData.addError("kgElement", e);
    }
  };
  isKeepgrowElementPresent = async () => {
    this.reportData.log("kgElement");
    try {
      const element = await this.playwright.waitForSelector("#KG_section", { timeout: 5000 });
      // const isElementPresent = (await this.playwright.$("#KG_section")) !== null;
      if (element) return true;
      this.reportData.addError("kgElement", "No matching elements found.");
    } catch (e) {
      console.log("🔴", "no KGElement");
      this.reportData.addError("kgElement", e);
    }
  };
  isFooterPresent = async () => {
    this.reportData.log("footer");
    try {
      const element = await this.playwright.waitForSelector("#KG_footer", { timeout: 5000 });
      if (element) return true;
      this.reportData.addError("footer", "No matching elements found.");
    } catch (e) {
      this.reportData.addError("footer", e);
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

      const inCludescripts = await this.playwright.evaluate((targetScripts: string[]) => {
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
      this.reportData.log(this.page + "-screenshot");
      await this.playwright.screenshot({ path: this.reportData.getScreenShotPath() });
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

      // await this.playwright.waitForSelector(kakaoLoginSelector);

      await this.playwright.click(kakaoLoginSelector);
      await this.playwright.waitForLoadState("networkidle");

      const currentUrl = this.playwright.url();

      if (!successUrls.some((url) => currentUrl.includes(url))) {
        this.reportData.addError("kakaoLogin", "kakao login failed");
      }
    } catch (e: unknown | any) {
      this.reportData.addError("kakaoLogin", e?.name || e);
    }
  };

  isNoMemberLinkPresent = async () => {
    try {
      this.reportData.log("noMemberLink");
      const noMemberLinkSelector = "a:text('비회원 구매')";
      const element = await this.playwright.waitForSelector(noMemberLinkSelector, { timeout: 5000 });
      console.log("🟢", "noMemberLink", element);
      if (!element) {
        this.reportData.addError("noMemberLink", "No matching elements found.");
      }
      return true;
    } catch (e: unknown | any) {
      this.reportData.addError("noMemberLink", e?.name || e);
    }
    return false;
  };
}

const isScriptIncluded = async (playwright: any, targetScripts: string[]) => {
  return await playwright.evaluate((targetScripts: string[]) => {
    return targetScripts.some((scriptName: string) => {
      const res = Array.from(document.querySelectorAll("script[src]"))
        .map((script) => (script as HTMLScriptElement).src) // src 속성 값 추출
        .filter((src) => src.includes(scriptName));
      return res.length > 0;
    });
  }, targetScripts);
};
