import { TestSetting } from "../../_setting";
import { ServiceGroup } from "../types/serviceGroup";

require("dotenv").config();

const ROOT_URL = "http://admin-supporter.keepgrow.com/admin-supporter/api/keepgrow-service";

const TOKEN = process.env.KG_TOKEN;

const BuildApi = {
  /**
   * 일괄 빌드 대상자 생성 요청
   * return batchId
   */
  postBuilds: async () => {
    try {
      const response = await fetch(ROOT_URL + "/test/build/batch/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`
        }
      });
      const res = await response.json();
      return res.data?.batchId;
    } catch (e) {
      throw e;
    }
  },

  /**
   *
   * 일괄 빌드 상태 조회 T/F
   * progressCount : 0
   */
  checkbuildProgressFinish: async (batchId: string) => {
    try {
      const response = await fetch(ROOT_URL + `/build/batch/status?batchId=${batchId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`
        }
      });
      const res = await response.json();

      return res?.data && res.data?.progressCount === 0;
    } catch (e) {
      throw e;
    }
  },

  checkIsProgressFinish: (data: { progressCount: number }) => {
    return data.progressCount === 0;
  },

  /**
   * 일괄 빌드 실행 요청
   * serviceGroupIdxs : [1,2,3,4,5,6,7,8,9,10]
   */
  batchRequest: async (batchId: string) => {
    console.log(batchId);
    try {
      const response = await fetch(ROOT_URL + `/build/batch/progress?batchId=${batchId}&size=${TestSetting.size}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`
        }
      });
      const res = await response.json();
      return res?.data?.serviceGroupIdxs || [];
    } catch (e) {
      throw e;
    }
  },

  // { vendorKey: 'CAFE24', KGJS_domain: 'pinkparfait.com' }
  getServiceGroup: async (serviceGroupIdx: string): Promise<ServiceGroup> => {
    try {
      const response = await fetch(
        `http://admin-supporter.keepgrow.com/admin-supporter/api/keepgrow-service/service-groups/${serviceGroupIdx}/kakaosync/mall`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`
          }
        }
      );
      const result = (await response.json()).data;
      return new ServiceGroup(serviceGroupIdx, result);
    } catch (e) {
      throw e;
    }
  }
};

export default BuildApi;
