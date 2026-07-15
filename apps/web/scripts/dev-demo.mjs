// Launches the app on 0.0.0.0 so it is reachable from a phone on the same Wi-Fi,
// and prints that URL. The app is self-contained — the words ship with it, so
// there is no API server, database, or login to start.
import { spawn } from 'node:child_process';
import { networkInterfaces } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const webDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Best-guess LAN IPv4 (prefers real Wi-Fi/Ethernet over virtual switches). */
function lanIp() {
  const candidates = [];
  for (const [name, addresses] of Object.entries(networkInterfaces())) {
    for (const address of addresses ?? []) {
      if (address.family !== 'IPv4' || address.internal) continue;
      if (address.address.startsWith('169.254.')) continue; // link-local
      let score = address.address.startsWith('192.168.') ? 3 : address.address.startsWith('10.') ? 2 : 1;
      if (/vEthernet|Default Switch|VirtualBox|VMware|Hyper-V|Loopback/i.test(name)) score -= 3;
      if (/Wi-?Fi|Wireless|Ethernet/i.test(name)) score += 1;
      candidates.push({ ip: address.address, score });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0]?.ip ?? null;
}

const ip = lanIp();
const nextBin = resolve(webDir, 'node_modules/next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, 'dev', '-H', '0.0.0.0', '-p', '3000'], {
  cwd: webDir,
  stdio: 'inherit',
  env: process.env,
});

if (ip) console.log(`\n📱 On your phone (same Wi-Fi): http://${ip}:3000\n`);

child.on('exit', (code) => process.exit(code ?? 0));
