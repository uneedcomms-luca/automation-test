const time = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).toISOString().replace(/T/, " ").replace(/\..+/, "");
const fs = require("fs");

class Report {
  count = 1;
  time = time;
  constructor(url) {
    this.name = url;
    this.error = [];
  }

  addError = (type, message) => {
    this.error.push({ type, message });
  };

  log = (type) => {
    console.log(`${this.count} - ${this.name} - ${type} - PROGRESS`);
    this.count++;
  };
}

Report.saveReport = (hosting, result) => {
  fs.writeFileSync(`report/${hosting}/${time}/report.json`, JSON.stringify(result, null, 2));
};

Report.getScreenShotPath = (hosting, url, path) => {
  return `report/${hosting}/${time}/screenshot/${path}/${url}.png`;
};

module.exports = Report;
