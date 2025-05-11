// src/config/db.js
// connect to the database -> prisma is an ORM (object-relaation mapper) which allows us to interact with the database using javascript objects
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = prisma;
