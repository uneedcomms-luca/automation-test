import { HostingType } from "../../utils/constants";
import { HOSTING_URL } from "../../utils/hosting-data";
import { SyncTest } from "../sync-test";

export const loginTest = async (hosting: HostingType, test: SyncTest) => {
  test.setTestPage("login");
  // 1. 로그인 페이지 이동 및 스크린샷
  const navigate = await test.navigate(HOSTING_URL[hosting].login);
  if (!navigate) return;

  await test.screenshot();

  // 2. 스크립트 삽입 확인 -> 없으면 끝
  const isKGScriptIncluded = await test.isKGScriptIncluded();
  if (!isKGScriptIncluded) return;

  // 테스트 스크립트 확인 - test.isTestKGScriptIncluded();

  // 3. init 스크립트 삽입 확인 -> 없으면 inactive
  const isInitScriptIncluded = await test.isInitScriptIncluded();
  if (!isInitScriptIncluded) return;

  // 3. KG Element 확인 -> 없으면 uiHide 일수도 ?
  const isKeepgrowElementPresent = await test.isKeepgrowElementPresent();
  if (!isKeepgrowElementPresent) return;

  // footer 확인
  const isFooterPresent = await test.isFooterPresent();
  if (!isFooterPresent) return;

  // if (hosting === "CAFE24") {
  //   // <a>비회원 구매</a> 확인
  //   const navigate = await test.navigate(HOSTING_URL[hosting].login + "?noMember=1");
  //   if (!navigate) return;

  //   const isNoMemberLinkPresent = await test.isNoMemberLinkPresent();
  //   if (!isNoMemberLinkPresent) return;
  // }

  // 4. 로그인 버튼 클릭 확인
  const checkNextPageIsKakaoLogin = await test.checkNextPageIsKakaoLogin();
};
