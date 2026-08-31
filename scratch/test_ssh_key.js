const fs = require('fs');
const path = require('path');
const os = require('os');
const { Client } = require('ssh2');

const keyPath1 = path.join(os.homedir(), '.ssh', 'id_ed25519_121_125_61_114');
const keyPath2 = path.join(os.homedir(), '.ssh', 'id_rsa');

console.log("KeyPath1 exists?", fs.existsSync(keyPath1));
console.log("KeyPath2 exists?", fs.existsSync(keyPath2));

if (fs.existsSync(keyPath1)) {
  const keyContent = fs.readFileSync(keyPath1, 'utf8');
  console.log("KeyPath1 first line:", keyContent.split('\n')[0]);
}

const conn = new Client();
conn.on('ready', () => {
  console.log("SUCCESSFULLY CONNECTED TO SSH!");
  conn.end();
}).on('error', (err) => {
  console.error("SSH ERROR:", err.message);
}).connect({
  host: '121.125.61.114',
  port: 22,
  username: 'saju-artpani',
  privateKey: fs.readFileSync(keyPath1)
});
