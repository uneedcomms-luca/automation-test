const callUntilResponse = async (fn: () => Promise<boolean>, maxAttempts = 30, delay = 2000) => {
  let count = 0;

  while (count < maxAttempts) {
    try {
      const response = await fn();
      if (response) {
        return response;
      }
    } catch (error) {
      console.log(`🔴 요청 실패 (Attempt ${count + 1})`, error);
    }

    await new Promise((r) => setTimeout(r, delay));
    count++;
  }

  console.log("🔴 PROCESS 실패 (최대 시도 횟수 도달)");
  return false;
};

export default callUntilResponse;