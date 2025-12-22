const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer((req, res) => {
  let filePath = req.url;
  
  // Prevent path traversal
  if (filePath.includes('..') || filePath.includes('%2e')) {
    res.writeHead(403, { 'Content-Type': 'text/html' });
    res.end('<h1>403 - Forbidden</h1>', 'utf-8');
    return;
  }
  
  if (filePath === '/') {
    filePath = '/index.html';
  }
  
  // Only serve specific files
  const allowedFiles = ['/index.html', '/client.js', '/style.css'];
  if (!allowedFiles.includes(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - File Not Found</h1>', 'utf-8');
    return;
  }
  
  filePath = '.' + filePath;

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
  };

  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 - File Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end('Internal Server Error', 'utf-8');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

const clients = new Map();

wss.on('connection', (ws) => {
  let clientId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (!data || typeof data.type !== 'string') {
        return;
      }

      switch (data.type) {
        case 'register':
          if (!data.id || typeof data.id !== 'string' || data.id.length > 50) {
            return;
          }
          clientId = data.id.replace(/[^a-zA-Z0-9]/g, '');
          clients.set(clientId, ws);
          ws.send(JSON.stringify({ type: 'registered', id: clientId }));
          break;

        case 'offer':
        case 'answer':
        case 'ice-candidate':
          const targetClient = clients.get(data.target);
          if (targetClient && targetClient.readyState === WebSocket.OPEN) {
            targetClient.send(JSON.stringify({
              type: data.type,
              data: data.data,
              from: clientId
            }));
          }
          break;

        case 'call':
          const callTarget = clients.get(data.target);
          if (callTarget && callTarget.readyState === WebSocket.OPEN) {
            callTarget.send(JSON.stringify({
              type: 'incoming-call',
              from: clientId
            }));
          }
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    if (clientId) {
      clients.delete(clientId);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
