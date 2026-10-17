const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript' };

function loadTasks() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e5) reject(new Error('body too large'));
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error('invalid JSON'));
      }
    });
  });
}

async function handleApi(req, res, url) {
  const tasks = loadTasks();
  const match = url.pathname.match(/^\/api\/tasks\/(\d+)$/);

  if (url.pathname === '/api/tasks' && req.method === 'GET') {
    return sendJson(res, 200, tasks);
  }

  if (url.pathname === '/api/tasks' && req.method === 'POST') {
    const { title } = await readBody(req);
    if (typeof title !== 'string' || !title.trim()) {
      return sendJson(res, 400, { error: 'العنوان مطلوب' });
    }
    const task = {
      id: tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1,
      title: title.trim().slice(0, 200),
      done: false,
      createdAt: new Date().toISOString(),
    };
    tasks.push(task);
    saveTasks(tasks);
    return sendJson(res, 201, task);
  }

  if (match) {
    const index = tasks.findIndex((t) => t.id === Number(match[1]));
    if (index === -1) return sendJson(res, 404, { error: 'المهمة غير موجودة' });

    if (req.method === 'PATCH') {
      const { done } = await readBody(req);
      if (typeof done === 'boolean') tasks[index].done = done;
      saveTasks(tasks);
      return sendJson(res, 200, tasks[index]);
    }

    if (req.method === 'DELETE') {
      tasks.splice(index, 1);
      saveTasks(tasks);
      return sendJson(res, 204);
    }
  }

  sendJson(res, 404, { error: 'غير موجود' });
}

function serveStatic(res, pathname) {
  const filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    serveStatic(res, url.pathname);
  } catch (err) {
    sendJson(res, 400, { error: err.message });
  }
});

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
