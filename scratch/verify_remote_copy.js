const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
conn.on('ready', () => {
  const nodeCopyScript = `node -e "
    const fs = require('fs');
    const files = [
      'src/app/result/page.js',
      'src/app/input/page.js',
      'src/app/artpani/page.js',
      'src/app/page.js',
      'src/app/api/payment-webhook/route.js',
      'prisma/seed-products.js'
    ];
    for (const f of files) {
      try {
        const content = fs.readFileSync('/tmp/saju_deploy_new/' + f, 'utf8');
        fs.writeFileSync('/home/www/saju-artpani/frontend/' + f, content, { encoding: 'utf8', flag: 'w' });
        console.log('Successfully wrote ' + f);
      } catch (e) {
        console.error('Error writing ' + f + ':', e.message);
      }
    }
  "`;

  conn.exec(nodeCopyScript, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
    .on('data', data => console.log('STDOUT:', data.toString()))
    .stderr.on('data', data => console.error('STDERR:', data.toString()));
  });
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'artpani',
  privateKey: fs.readFileSync('C:\\Users\\user\\.ssh\\id_ed25519_121_125_61_114')
});
