import { chromium, devices } from "playwright";
import BuildApi from "../utils/api/build";
import { Report } from "../utils/report";
import { testByVendorKey } from "./testByVendorKey";

const testInitScript = async (data: string[]) => {
  console.log("▶️ TEST START");

  const report = new Report();

  const browser = await chromium.launch({ headless: true });
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

      await testByVendorKey(serviceGroup.vendorKey, serviceGroup, testPage, report);
    } catch (e) {
      console.log(e);
    }
  }

  await browser.close();

  // 결과 저장 (json)
  report.saveReport();
};

export default testInitScript;
