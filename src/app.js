// src/app.js
const express = require('express');
const cors = require('cors');
// const morgan = require('morgan');
// const helmet = require('helmet');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
// app.use(helmet());
app.use(express.json());
// app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
