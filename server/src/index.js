const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const menusRouter = require('./routes/menus');
const ordersRouter = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3001;
const clientDist = path.join(__dirname, '../../client/dist');
const hasClientBuild = fs.existsSync(path.join(clientDist, 'index.html'));

app.use(cors());
app.use(express.json());
app.use('/api/menus', menusRouter);
app.use('/api/orders', ordersRouter);

if (hasClientBuild) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.type('text/plain; charset=utf-8').send(
      '프론트엔드가 아직 빌드되지 않았습니다.\nclient 폴더에서 npm run build 를 실행하세요.'
    );
  });
}

app.listen(PORT, () => {
  console.log(`API 서버: http://localhost:${PORT}`);
  if (hasClientBuild) {
    console.log(`앱 열기: http://localhost:${PORT}`);
    console.log(`또는 client/dist/index.html 더블클릭 (서버 실행 중일 때)`);
  }
});
