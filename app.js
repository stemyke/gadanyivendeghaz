const { createServer } = require('http');
const { parse } = require('url');
const fs = require('fs');
const path = require('path');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;

// 1. Setup Log File Redirects
const logFilePath = path.join(__dirname, 'server.log');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Redirect console.log and console.error to write to the file
console.log = function (d) {
    logStream.write(`[LOG] [${new Date().toISOString()}] ${d}\n`);
    process.stdout.write(d + '\n');
};
console.error = function (d) {
    logStream.write(`[ERROR] [${new Date().toISOString()}] ${d}\n`);
    process.stderr.write(d + '\n');
};

// 2. Basic Auth Helper Function
function checkBasicAuth(req) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return false;

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];

    // Pull credentials from your environment variables
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
            // Prompt for basic auth if missing or invalid
            if (!checkBasicAuth(req)) {
                res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Secure Server Logs"' });
                res.end('Authentication required.');
                return;
            }

            // Read and serve the log file
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

        // Let Next.js handle all other standard routing
        handle(req, res, parsedUrl);
    }).listen(PORT, (err) => {
        if (err) throw err;
        console.log(`Application started on port ${PORT}`);
    });
});
