import { chromium, devices } from "playwright";
import BuildApi from "../utils/api/build";
import { Report } from "../utils/report/report";
import { testByVendorKey } from "./testByVendorKey";

const testInitScript = async (data: string[]) => {
  console.log("▶️ TEST START");

  const report = new Report();

  const browser = await chromium.launch({ headless: false });

  const mobileContext = await browser.newContext({ ...devices["iPhone 12 Pro"] });
  const pcContext = await browser.newContext();

  const mobileTestPage = await mobileContext.newPage();
  const pcTestPage = await pcContext.newPage();

  for (let idx of data) {
    try {
      const serviceGroup = await BuildApi.getServiceGroup(idx);
      console.log("✅ ", serviceGroup.idx, "번 테스트 시작");

      if (!serviceGroup.KGJS_domain || !serviceGroup.vendorKey) {
        report.addReportNoServiceGroup(serviceGroup);
        continue;
      }

      console.log(`📲 ${idx}번 모바일 환경 테스트`);

      await testByVendorKey({
        vendorKey: serviceGroup.vendorKey,
        serviceGroup,
        testPage: mobileTestPage,
        report,
        env: "mobile"
      });

      console.log(`💻 ${idx}번 PC 환경 테스트`);
      await testByVendorKey({
        vendorKey: serviceGroup.vendorKey,
        serviceGroup,
        testPage: pcTestPage,
        report,
        env: "pc"
      });
    } catch (e) {
      console.log(e);
    }
  }

  await browser.close();

  // 결과 저장 (json)
  report.saveReport();
};

export default testInitScript;
