require('dotenv').config();

const url = process.env.DATABASE_URL || 'sqlite:./data/cozy.db';
const usePg = url.startsWith('postgresql://') || url.startsWith('postgres://');

module.exports = usePg ? require('./db-pg') : require('./db-sqlite');
