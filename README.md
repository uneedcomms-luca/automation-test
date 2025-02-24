# automation-test


전체 : keepgrowservice:test:build:${batchId}:original
잔여 : keepgrowservice:test:build:${batchId}:request
종료 : keepgrowservice:test:build:${batchId}:complete


연결 : `ssh -i ~/.ssh/Keepgrow.pem -L 6379:redis.keepgrow.world:6379 ubuntu@13.124.200.39`

DB 10번 