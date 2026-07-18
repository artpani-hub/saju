const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH Connected.');

  // 원격지에서 실행하여 http://localhost:3012/api/payment-webhook 를 호출하는 스크립트
  const nodeScript = `
const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== Checking current remote DB state for Order 1889 ===");
  let order = await prisma.order.findUnique({
    where: { id: "1889" }
  });
  if (!order) {
    console.error("Order 1889 not found on remote server. Cancel test.");
    return;
  }
  console.log("Before Webhook call (Remote):");
  console.log("  Order Status:", order.status);
  console.log("  ReportStatus:", order.reportStatus);

  console.log("\\n=== Sending Mock Webhook POST request to localhost:3012/api/payment-webhook ===");
  
  const payload = JSON.stringify({
    type: "Transaction.Paid",
    data: {
      paymentId: "payment_1889_1784298610468",
      storeId: "store-312155f8-f523-4067-a568-285c7bbec6e0"
    }
  });

  const req = http.request({
    hostname: '127.0.0.1',
    port: 3012,
    path: '/api/payment-webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', async () => {
      console.log('Webhook Response HTTP Status:', res.statusCode);
      console.log('Webhook Response Body:', data);

      // 잠시 DB 반영을 기다린 후 재확인
      setTimeout(async () => {
        console.log("\\n=== Checking updated remote DB state for Order 1889 ===");
        order = await prisma.order.findUnique({
          where: { id: "1889" },
          include: { user: { include: { reports: true } } }
        });
        console.log("After Webhook call (Remote):");
        console.log("  Order Status:", order.status);
        console.log("  ReportStatus:", order.reportStatus);
        if (order.user && order.user.reports.length > 0) {
          console.log("  SajuReport Unlocked:", order.user.reports[0].unlocked);
          console.log("  SajuReport Status:", order.user.reports[0].status);
        }
        await prisma.$disconnect();
        process.exit(0);
      }, 1000);
    });
  });

  req.on('error', (err) => {
    console.error('HTTP Request Error:', err);
    prisma.$disconnect();
    process.exit(1);
  });

  req.write(payload);
  req.end();
}

main().catch(console.error);
`;

  // 원격지에 쓰기
  conn.exec(`cat << 'EOF' > /home/www/saju-artpani/frontend/test_remote_webhook_endpoint.js\n${nodeScript}\nEOF`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      console.log('test_remote_webhook_endpoint.js created on server. Executing it...');
      
      // 실행
      conn.exec('DATABASE_URL="file:/home/www/saju-artpani/frontend/prisma/dev.db" node /home/www/saju-artpani/frontend/test_remote_webhook_endpoint.js', (execErr, execStream) => {
        if (execErr) throw execErr;
        let execOutput = '';
        execStream.on('close', () => {
          console.log('Output from remote server:\n', execOutput);
          conn.end();
        }).on('data', (data) => {
          execOutput += data.toString();
        });
      });
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
