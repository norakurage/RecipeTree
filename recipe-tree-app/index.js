const http = require('http');

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Soulmask Recipe Tree が起動しました！');
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});