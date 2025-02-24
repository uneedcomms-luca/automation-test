import { TestSetting } from "./_setting";
import testInitScript from "./test/init";
import BuildApi from "./utils/api/build";
import callUntilResponse from "./utils/api/fetch";
// import { getRedisValue } from "./utils/api/redis";

const excute = async () => {
  // 세팅 값에 있다면 그 값을 사용, 없다면 BuildApi.postBuilds()를 호출하여 batchId 가져옴
  const batchId = TestSetting.batchId || (await BuildApi.postBuilds());
  console.log("🟠 BATCHID =", batchId);

  // BuildApi.checkbuildProgressFinish()를 호출하여 빌드가 다 되었는지 확인
  const checkbuildProgressFinish = await callUntilResponse(() => BuildApi.checkbuildProgressFinish(batchId));
  console.log("🟢 PROCESS 완료", checkbuildProgressFinish);

  if (!checkbuildProgressFinish) {
    console.log("🔴 PROCESS 실패");
    return;
  }

  // 새로운 배치 request 신청 요청
  const serviceGroups = await BuildApi.batchRequest(batchId);
  console.log("🟤 batch request 목록= ", serviceGroups);

  const checkbuildProgressFinish2 = await callUntilResponse(() => BuildApi.checkbuildProgressFinish(batchId));
  console.log("🟢 PROCESS2 완료", checkbuildProgressFinish);

  if (!checkbuildProgressFinish2) {
    console.log("🔴 PROCESS2 실패");
    return;
  }

  // const serviceGroups = (await getRedisValue(batchId + ":complete")) as string[];
  // console.log("🔵 serviceGroups = ", serviceGroups.slice(0, 10));

  testInitScript(serviceGroups);
};

excute();
