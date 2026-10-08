const fs = require('fs');
const path = require('path');
const { createServer } = require('http');
const { parse } = require('url');

// Ensure production environment
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// 1. Setup Comprehensive Log File Stream
const logFilePath = path.join(__dirname, 'server.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

const origStdoutWrite = process.stdout.write.bind(process.stdout);
const origStderrWrite = process.stderr.write.bind(process.stderr);

process.stdout.write = function (chunk, encoding, callback) {
  try {
    logStream.write(chunk);
  } catch {}
  return origStdoutWrite(chunk, encoding, callback);
};

process.stderr.write = function (chunk, encoding, callback) {
  try {
    logStream.write(`[ERR] [${new Date().toISOString()}] ${chunk}`);
  } catch {}
  return origStderrWrite(chunk, encoding, callback);
};

process.on('uncaughtException', (err) => {
  const msg = `[CRASH] Uncaught exception: ${err && err.stack ? err.stack : err}\n`;
  try { logStream.write(msg); } catch {}
  origStderrWrite(msg);
});

process.on('unhandledRejection', (reason) => {
  const msg = `[CRASH] Unhandled rejection: ${reason && reason.stack ? reason.stack : reason}\n`;
  try { logStream.write(msg); } catch {}
  origStderrWrite(msg);
});

// Ensure Prisma Client is generated (only executes if missing, never on normal reboots)
try {
  require.resolve('.prisma/client/default');
} catch (e) {
  try {
    console.log('Prisma Client not found. Running initial generation...');
    const { runGenerate } = require('./prisma/generate');
    runGenerate();
  } catch (err) {
    console.error('Failed to auto-generate Prisma Client:', err);
  }
}

const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

// 2. Basic Auth Helper Function
function checkBasicAuth(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return false;

  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];

  const expectedUser = process.env.LOG_USER || 'admin';
  const expectedPass = process.env.LOG_PASS || 'password123';

  return user === expectedUser && pass === expectedPass;
}

// 3. Start the Server
app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // Custom route to view logs via browser
    if (pathname === '/view-server-logs') {
      if (!checkBasicAuth(req)) {
        res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Secure Server Logs"' });
        res.end('Authentication required.');
        return;
      }

      fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('No log file found or error reading logs.');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(data);
      });
      return;
    }

    handle(req, res, parsedUrl);
  }).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`Application started on port ${PORT} [NODE_ENV=${process.env.NODE_ENV}]`);
  });
});
