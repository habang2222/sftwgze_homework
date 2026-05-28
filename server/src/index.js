const express = require('express');
const cors = require('cors');
require('dotenv').config();

const menusRouter = require('./routes/menus');
const ordersRouter = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/menus', menusRouter);
app.use('/api/orders', ordersRouter);

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
