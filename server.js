const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'contacts.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//서버에서 데이터 요청 부분
app.get('/api/contacts', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') return res.json([]);
      return res.status(500).json({ error: '서버 오류' });
    }
    try {
      const contacts = JSON.parse(data);
      res.json(contacts);
    } catch {
      res.status(500).json({ error: '데이터 파싱 오류' });
    }
  });
});

//서버에서 저장 부분
app.post('/api/contacts', (req, res) => {
  const contacts = req.body;
  if (!Array.isArray(contacts)) {
    return res.status(400).json({ error: '연락처 배열이 아닙니다.' });
  }
  fs.writeFile(DATA_FILE, JSON.stringify(contacts, null, 2), err => {
    if (err) return res.status(500).json({ error: '저장 실패' });
    res.json({ message: '저장 성공' });
  });
});

//서버에서 지우기 부분
app.delete('/api/contacts/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read data' });

    let contacts = JSON.parse(data);
    if (index >= 0 && index < contacts.length) {
      contacts.splice(index, 1);
      fs.writeFile(DATA_FILE, JSON.stringify(contacts, null, 2), err => {
        if (err) return res.status(500).json({ error: 'Failed to save data' });
        res.json({ success: true });
      });
    } else {
      res.status(400).json({ error: 'Invalid index' });
    }
  });
});


app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
