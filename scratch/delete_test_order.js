const { Client } = require('ssh2');
const path = require('path');
const fs = require('fs');

const conn = new Client();
const remoteRoot = '/home/www/saju-artpani/frontend';

conn.on('ready', () => {
  console.log('SSH Connected for deleting test order.');
  
  // 원격 서버에 delete_temp.js 작성 및 실행
  const scriptContent = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. 테스트 주문 삭제 (이름이 '나나2', '사사사', '미미사' 등인 주문)
  const deletedOrders = await prisma.order.deleteMany({
    where: {
      user: {
        name: {
          in: ['나나2', '사사사', '미미사', '미미누']
        }
      }
    }
  });
  console.log(\`Deleted \${deletedOrders.count} test orders.\`);
  
  // 2. 테스트 User 삭제
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      name: {
        in: ['나나2', '사사사', '미미사', '미미누']
      }
    }
  });
  console.log(\`Deleted \${deletedUsers.count} test users.\`);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
  `;

  const runCmd = `
    cd ${remoteRoot}
    cat << 'EOF' > scratch/delete_temp.js
${scriptContent}
EOF
    node scratch/delete_temp.js
    rm -f scratch/delete_temp.js
  `;
  
  conn.exec(runCmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code) => {
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(path.join(require('os').homedir(), '.ssh', 'id_ed25519_121_125_61_114'))
});
