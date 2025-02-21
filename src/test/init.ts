import { chromium, devices } from "playwright";
import BuildApi from "../utils/api/build";
import { cafe24TestScript } from "./cafe24";
import { Report } from "../utils/report";
import { imwebTestScript } from "./imweb";
import { makeshopTestScript } from "./makeshop";

const testInitScript = async (data: string[]) => {
  console.log("▶️ TEST START");

  const report = new Report();

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ ...devices["iPhone 12 Pro"] });
  const testPage = await context.newPage();

  for (let idx of data) {
    try {
      const serviceGroup = await BuildApi.getServiceGroup(idx);
      console.log("✅ ", serviceGroup.idx, "번 테스트 시작");

      if (!serviceGroup.KGJS_domain || !serviceGroup.vendorKey) {
        report.addReportNoServiceGroup(serviceGroup);
        continue;
      }

      await mapTestScript[serviceGroup.vendorKey](serviceGroup, testPage, report);
    } catch (e) {
      console.log(e);
    }
  }

  await browser.close();

  // 결과 저장 (json)
  report.saveReport();
};

const mapTestScript = {
  CAFE24: cafe24TestScript,
  IMWEB: imwebTestScript,
  MAKESHOP: makeshopTestScript
};

export default testInitScript;
