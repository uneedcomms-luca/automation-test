import testInitScript from "./test/init";
import BuildApi from "./utils/api/build";
import { getRedisValue } from "./utils/api/redis";

const excute = async () => {
  const batchId = await BuildApi.postBuilds();
  console.log("🟠 BATCHID =", batchId);

  {
    const checkbuildProgressFinish = await BuildApi.checkbuildProgressFinish(batchId);
    if (!checkbuildProgressFinish) {
      console.log("🔴", "Progressing...");
      return;
    }
    console.log("🟣 PROCESS =", checkbuildProgressFinish);
  }

  {
    const serviceGroupIdxs = await BuildApi.batchRequest(batchId);
    console.log("🟤 serviceGroupIdx= ", serviceGroupIdxs);
  }

  const serviceGroups = await getRedisValue(batchId + ":complete");
  console.log("🔵 serviceGroups = ", serviceGroups);

  testInitScript(serviceGroups);
};

excute();
