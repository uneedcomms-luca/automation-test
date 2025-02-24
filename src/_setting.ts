export const TestSetting: TestSettingType = {
  date: "2025-02-23",
  size: 10,
  batchId: "keepgrowservice:test:build:b422bc11-f582-4482-a1d7-1fa14c78b532"
};
interface TestSettingType {
  date: string;
  size: number;
  batchId: string | null;
}
