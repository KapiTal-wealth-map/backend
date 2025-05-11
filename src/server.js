// src/server.js

const app = require('./app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const { PORT } = require('./config/env');

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`[Database] Connected to database`);
    console.log(`[Server] Server is running on port ${PORT}`);
  } catch (error) {
    console.error('[Database] Failed to connect to database:', error);
    process.exit(1);
  }
});
