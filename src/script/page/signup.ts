import { HostingType } from "../../utils/constants";
import { HOSTING_URL } from "../../utils/hosting-data";
import { SyncTest } from "../sync-test";

export const signupTest = async (hosting: HostingType, test: SyncTest) => {
  test.setTestPage("signup");

  const navigate = await test.navigate(HOSTING_URL[hosting].signup);
  if (!navigate) return;

  // 2. 스크립트 삽입 확인 -> 없으면 끝
  const isKGScriptIncluded = await test.isKGScriptIncluded();
  if (!isKGScriptIncluded) return;

  let isKgElement = await test.isKeepgrowElementPresentNoReport();
  if (!isKgElement) {
    if (hosting === "CAFE24") {
      await test.navigate(HOSTING_URL[hosting].signup2);
      isKgElement = await test.isKeepgrowElementPresent();
    }
  }

  await test.screenshot();
  if (!isKgElement) return;

  // 3. init 스크립트 삽입 확인 -> 없으면 inactive
  const isInitScriptIncluded = await test.isInitScriptIncluded();
  if (!isInitScriptIncluded) return;

  // 3. KG Element 확인 -> 없으면 uiHide 일수도 ?
  const isKeepgrowElementPresent = await test.isKeepgrowElementPresent();
  if (!isKeepgrowElementPresent) return;

  // 4. 로그인 버튼 클릭 확인
  const checkNextPageIsKakaoLogin = await test.checkNextPageIsKakaoLogin();
};
