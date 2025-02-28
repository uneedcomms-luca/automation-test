import { TestSetting } from "./_setting";
import testInitScript from "./script/init";
import BuildApi from "./utils/api/build";
import callUntilResponse from "./utils/api/fetch";

const excute = async () => {
  // 세팅 값에 있다면 그 값을 사용, 없다면 BuildApi.postBuilds()를 호출하여 batchId 가져옴
  const batchId = TestSetting.batchId || (await BuildApi.postBuilds());
  if (!batchId) {
    console.log("🔴 no batchId", batchId);
    return;
  }
  console.log("✅ BATCHID =", batchId);

  // 새로운 배치 request 신청 요청
  const serviceGroups = await BuildApi.batchRequest(batchId);
  if (!serviceGroups) {
    console.log("🔴 serviceGroups 없음");
    return;
  }
  console.log("✅ batch request list = ", serviceGroups);

  const checkbuildProgressFinish = await callUntilResponse(() => BuildApi.checkbuildProgressFinish(batchId));

  if (!checkbuildProgressFinish) {
    console.log("🔴 PROCESS 실패");
    return;
  }
  console.log("✅ PROCESS 완료");

  // const serviceGroups = (await getRedisValue(batchId + ":complete")) as string[];
  // console.log("🔵 serviceGroups = ", serviceGroups.slice(0, 10));

  if (!serviceGroups.length) {
    console.log("🔴 serviceGroups 없음");
    return;
  }

  testInitScript(serviceGroups);
};

excute();
