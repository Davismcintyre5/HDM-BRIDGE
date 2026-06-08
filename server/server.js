process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) {
    return;
  }
  console.warn(warning.name, warning.message);
});

require('dotenv').config();
require('./config/dnsSet');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { fork } = require('child_process');
const path = require('path');
const connectDB = require('./config/database');
const { connectRedis, getRedisClient } = require('./config/redis');
const routes = require('./routes/index');
const { errorHandler } = require('./middleware/common/errorHandler');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
  }));
} else {
  app.use(morgan('dev'));
}

app.set('trust proxy', 1);

app.get('/', (req, res) => {
  res.status(200).json({
    name: process.env.APP_NAME || 'HDM BRIDGE',
    version: '1.0.0',
    description: 'Enterprise Email Sending Platform API',
    status: 'running',
    docs: (process.env.BASE_URL || 'http://localhost:5000') + '/api',
    health: (process.env.BASE_URL || 'http://localhost:5000') + '/health',
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HDM BRIDGE API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      emails: '/api/emails',
      apiKeys: '/api/api-keys',
      domains: '/api/domains',
      templates: '/api/templates',
      logs: '/api/logs',
      billing: '/api/billing',
      currency: '/api/currency',
      chat: '/api/chat',
      tracking: '/api/track',
      webhooks: {
        stripe: '/api/payments/stripe/webhook',
        mpesa: '/api/payments/mpesa/callback',
        paypal: '/api/payments/paypal/webhook',
      },
    },
    admin: '/admin/api',
    health: '/health',
  });
});

app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    server: 'running',
    database: 'unknown',
    redis: 'unknown',
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
    },
  };

  try {
    health.database = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  } catch {
    health.database = 'error';
  }

  try {
    const redis = getRedisClient();
    await redis.ping();
    health.redis = 'connected';
  } catch {
    health.redis = 'disconnected';
  }

  const statusCode = health.database === 'connected' ? 200 : 503;
  res.status(statusCode).json(health);
});

app.use('/', routes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: req.originalUrl,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  const banner = '\n' +
    '╔══════════════════════════════════════════════════════════╗\n' +
    '║                                                          ║\n' +
    '║   ██╗  ██╗██████╗ ███╗   ███╗  ██████╗ ██████╗ ██╗██████╗  ██████╗ ███████╗\n' +
    '║   ██║  ██║██╔══██╗████╗ ████║  ██╔══██╗██╔══██╗██║██╔══██╗██╔════╝ ██╔════╝\n' +
    '║   ███████║██║  ██║██╔████╔██║  ██████╔╝██████╔╝██║██║  ██║██║  ███╗█████╗\n' +
    '║   ██╔══██║██║  ██║██║╚██╔╝██║  ██╔══██╗██╔══██╗██║██║  ██║██║   ██║██╔══╝\n' +
    '║   ██║  ██║██████╔╝██║ ╚═╝ ██║  ██████╔╝██║  ██║██║██████╔╝╚██████╔╝███████╗\n' +
    '║   ╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝  ╚═════╝ ╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚══════╝\n' +
    '║                                                          ║\n' +
    '║              Enterprise Email Sending Platform            ║\n' +
    '║                                                          ║\n' +
    '╚══════════════════════════════════════════════════════════╝\n';

  console.log('\x1b[36m%s\x1b[0m', banner);

  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      console.log('');
      console.log('   🚀 Server running on port ' + PORT);
      console.log('   📡 API:        http://localhost:' + PORT + '/api');
      console.log('   🔧 Admin API:  http://localhost:' + PORT + '/admin/api');
      console.log('   ❤️  Health:     http://localhost:' + PORT + '/health');
      console.log('   🌐 Client:     ' + (process.env.CLIENT_URL || 'http://localhost:3000'));
      console.log('   🛠️  Admin UI:   ' + (process.env.ADMIN_URL || 'http://localhost:3001'));
      console.log('');
      console.log('   Environment: ' + (process.env.NODE_ENV || 'development'));
      console.log('   App Name:    ' + (process.env.APP_NAME || 'HDM BRIDGE'));
      console.log('');

      const workerPath = path.join(__dirname, 'workers', 'emailWorker.js');
      const worker = fork(workerPath, [], { silent: true });

      worker.stdout.on('data', (data) => {
        console.log('[Worker] ' + data.toString().trim());
      });

      worker.stderr.on('data', (data) => {
        console.error('[Worker] ' + data.toString().trim());
      });

      worker.on('close', (code) => {
        console.log('⚠️  Email worker exited with code ' + code);
      });

      console.log('   ✨ Ready to send emails!');
      console.log('');
    });

  } catch (error) {
    console.error('\n❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

async function gracefulShutdown(signal) {
  console.log('\n\n⚠️  ' + signal + ' received. Shutting down gracefully...\n');

  try {
    try {
      const redis = getRedisClient();
      await redis.quit();
      console.log('✅ Redis disconnected');
    } catch {}

    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB disconnected');
    } catch {}

    console.log('\n👋 Goodbye!\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error during shutdown:', error.message);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION: ' + err.message);
  console.error('\n❌ Unhandled Rejection:', err.message);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION: ' + err.message);
  console.error('\n❌ Uncaught Exception:', err.message);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

start();