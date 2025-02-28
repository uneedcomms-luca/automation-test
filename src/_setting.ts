export const TestSetting: TestSettingType = {
  // 2025-02-25
  date: new Date().toISOString().split("T")[0],
  size: 5,
  batchId: "keepgrowservice:test:build:1dc70a8e-88f9-4190-bb5c-90742e2cdfbf"
};
interface TestSettingType {
  date: string;
  size: number;
  batchId?: string;
}
