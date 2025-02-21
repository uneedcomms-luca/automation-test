const Redis = require("ioredis");

const redis = new Redis({
  host: "127.0.0.1", // 로컬에서 SSH 터널을 통해 Redis에 접속
  port: 6379,
  connectTimeout: 10000, // 연결 타임아웃 설정
  db: 13 // 13번 데이터베이스 사용
});

redis.on("connect", () => {
  console.log("🔗 Redis에 연결되었습니다!");
});

redis.on("error", (err: any) => {
  console.error("❌ Redis 연결 오류:", err);
});

async function getRedisValue(key: string) {
  try {
    const value = await redis.smembers(key);
    console.log(value);
    return value;
  } catch (err) {
    console.error("❌ Redis 조회 오류:", err);
  } finally {
    redis.quit();
  }
}

export { getRedisValue };
