import { TestSetting } from "../_setting";
import { ErrorData } from "./types/error-data";
import { ServiceGroup } from "./types/serviceGroup";

const time = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().replace(/T/, " ").replace(/\..+/, "");
const fs = require("fs");

// report/시간/screenshot/호스팅/idx.png
// report/시간/report.json

export class Report {
  result: { error: any[]; serviceGroup: ServiceGroup | number }[] = [];

  addReport = (reportData: ReportData) => {
    if (reportData.error.length === 0) return;

    this.result.push({
      serviceGroup: reportData.serviceGroup,
      error: reportData.error
    });
  };

  addReportNoServiceGroup = (serviceGroup: ServiceGroup) => {
    if (!serviceGroup.KGJS_domain && !serviceGroup.vendorKey) {
      this.result.push({
        serviceGroup,
        error: [new ErrorData("serviceGroup", "서비스그룹을 찾을 수 없습니다.")]
      });
      return;
    }
    if (!serviceGroup.KGJS_domain) {
      this.result.push({
        serviceGroup,
        error: [new ErrorData("serviceGroup", "도메인을 찾을 수 없습니다.")]
      });
    }
    if (!serviceGroup.vendorKey) {
      this.result.push({
        serviceGroup,
        error: [new ErrorData("serviceGroup", "호스팅사를 찾을 수 없습니다.")]
      });
    }
  };

  saveReport = () => {
    const dirPath = `report/${TestSetting.date}`;

    // 디렉터리가 없으면 생성
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(`${dirPath}/report.json`, JSON.stringify(this.result, null, 2));
  };
}

export class ReportData {
  count = 1;
  error: any[] = [];
  serviceGroup: ServiceGroup;
  page: "login" | "signup" = "login";

  constructor(serviceGroup: ServiceGroup) {
    this.serviceGroup = serviceGroup;
  }

  setTestPage = (page: "login" | "signup") => {
    this.page = page;
  };

  addError = (type: string, message: any) => {
    this.error.push({ page: this.page, type, message });
  };

  log = (type: string) => {
    console.log(`${this.count} - ${type} - PROGRESS`);
    this.count++;
  };

  getScreenShotPath = () => {
    return `./report/${TestSetting.date}/${this.serviceGroup.vendorKey}/${this.serviceGroup.idx}-${this.page}.png`;
    // return `report/${time}/screenshot/${this.serviceGroup.vendorKey}/${this.serviceGroup.idx}-${this.page}.png`;
  };
}
