const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { PrismaClient } = require('@prisma/client');

const conn = new Client();
const keyPath = path.join(os.homedir(), '.ssh', 'id_ed25519_121_125_61_114');

const remotePossiblePaths = [
  '/home/www/saju-artpani/frontend/prisma/dev.db',
  '/home/www/saju-artpani/frontend/dev.db',
  '/var/www/saju/prisma/dev.db',
  '/var/www/saju/dev.db',
  '/home/artpani/saju/prisma/dev.db',
  '/home/artpani/saju/dev.db'
];

conn.on('ready', () => {
  console.log('✔ SUCCESS! SSH Connected to server (121.125.61.114) with user [artpani] & SSH Key.');

  conn.sftp((err, sftp) => {
    if (err) {
      console.error('SFTP Error:', err.message);
      conn.end();
      return;
    }

    const localDbPath = path.join(__dirname, '..', 'dev.db');
    const localPrismaDbPath = path.join(__dirname, '..', 'prisma', 'dev.db');

    let pathIdx = 0;

    function tryDownload() {
      if (pathIdx >= remotePossiblePaths.length) {
        console.error('Could not find remote dev.db in tested paths.');
        conn.end();
        return;
      }

      const currentRemotePath = remotePossiblePaths[pathIdx];
      console.log(`Searching and downloading remote DB from: ${currentRemotePath}...`);

      sftp.fastGet(currentRemotePath, localDbPath, (getErr) => {
        if (getErr) {
          console.log(`Path skipped: ${currentRemotePath} (${getErr.message})`);
          pathIdx++;
          tryDownload();
        } else {
          console.log(`✔ DB Download SUCCESS from: ${currentRemotePath}!`);
          finishSync();
        }
      });
    }

    tryDownload();

    function finishSync() {
      fs.copyFileSync(localDbPath, localPrismaDbPath);
      console.log('✔ Updated local dev.db & prisma/dev.db with REMOTE server DB file!');
      conn.end();

      // Verify synced local data counts
      setTimeout(async () => {
        const prisma = new PrismaClient();
        try {
          const userCount = await prisma.user.count();
          const orderCount = await prisma.order.count();
          const productCount = await prisma.product.count();

          console.log('\n======================================================');
          console.log('🎉 REAL SERVER DB SYNC COMPLETED SUCCESSFULLY!');
          console.log('======================================================');
          console.log(`- Synced Server Customers (Users): ${userCount}`);
          console.log(`- Synced Server Orders (Orders): ${orderCount}`);
          console.log(`- Synced Server Products (Products): ${productCount}`);

          const latestOrders = await prisma.order.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
          });

          console.log('\n--- Latest 10 Server Orders Synced to Local ---');
          latestOrders.forEach((o, i) => {
            console.log(`${i+1}. [${o.createdAt.toISOString()}] ${o.user?.name || o.userName} (${o.user?.phone || '전화번호 미상'}) | ${o.productName} | ${o.amount.toLocaleString()}원 | 상태: ${o.status}`);
          });
        } catch (e) {
          console.error('Inspection note:', e.message);
        } finally {
          await prisma.$disconnect();
        }
      }, 1000);
    }
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'artpani',
  privateKey: fs.readFileSync(keyPath)
});
