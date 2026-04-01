const express = require('express');
const app = express();

app.use((req, res, next) => {
  req.headers = { 'user-agent': 'custom' };
  next(new Error('Test error'));
});

app.use((err, req, res, next) => {
  try {
    console.log("In error handler", req.get('User-Agent'));
    next(err);
  } catch (e) {
    console.error("Error handler crashed:", e);
    next(e);
  }
});

app.listen(3002, () => {
    const http = require('http');
    http.get('http://localhost:3002', (res) => {
        console.log("Status:", res.statusCode, "ContentType:", res.headers['content-type']);
        process.exit(0);
    });
});
