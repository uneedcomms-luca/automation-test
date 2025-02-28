import { Page } from "playwright";
import { Report } from "../utils/report/report";
import { SyncTest } from "../utils/sync-test";
import { HostingType } from "../utils/types/hosting";
import { ServiceGroup } from "../utils/types/serviceGroup";
import { loginTest } from "./page/login";
import { signupTest } from "./page/signup";

interface TestSettingParams {
  vendorKey: HostingType;
  serviceGroup: ServiceGroup;
  playwright: Page;
  report: Report;
  env: "mobile" | "pc";
}

export const testByVendorKey = async (params: TestSettingParams) => {
  const { vendorKey, serviceGroup, playwright, report, env } = params;
  console.log("🚀 ", serviceGroup.idx, `번 ${vendorKey} 테스트 시작`);

  const test = new SyncTest({ serviceGroup, playwright, env });

  //   test.setTestParams(true, true);
  await loginTest(vendorKey, test);
  await signupTest(vendorKey, test);

  report.addReport(test.reportData);
};

// TODO - imweb 에서 주소 갈림 /site_join_pattern_choice -> site_join_type_choice
