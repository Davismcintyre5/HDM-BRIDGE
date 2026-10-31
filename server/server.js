require('dotenv').config();

process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('punycode')) return;
  console.warn(warning.name, warning.message);
});

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

const connectDB = require('./config/database');
const { connectRedis, getRedisClient } = require('./config/redis');
const routes = require('./routes/index');
const { errorHandler } = require('./middleware/common/errorHandler');
const logger = require('./utils/logger');
const startEmailWorker = require('./workers/emailWorker');
const { startWorker: startSubscriptionWorker } = require('./workers/subscriptionWorker');
const { startKeepAlive, stopKeepAlive } = require('./config/keepAlive');

const APP_NAME = process.env.APP_NAME || 'HDM BRIDGE';
const VERSION = '1.0.0';
const PORT = process.env.PORT || 5000;
const APP_URL = (process.env.BASE_URL || `http://localhost:${PORT}`).replace(/\/+$/, '');
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/+$/, '');
const ADMIN_URL = (process.env.ADMIN_URL || 'http://localhost:3001').replace(/\/+$/, '');

const BOT_PROBES = [
  '/.env',
  '/.git',
  '/.gitignore',
  '/.htaccess',
  '/.ds_store',
  '/.vscode',
  '/.idea',
  '/.aws',
  '/.ssh',
  '/info.php',
  '/phpinfo.php',
  '/wp-admin',
  '/wp-login.php',
  '/wp-content',
  '/wp-includes',
  '/wp-json',
  '/xmlrpc.php',
  '/administrator',
  '/actuator',
  '/telescope',
  '/graphql',
  '/graphiql',
  '/v2/_catalog',
  '/server-status',
  '/server-info',
  '/trace.axd',
  '/elmah.axd',
  '/debug/default',
  '/ecp/current',
  '/@vite',
  '/_profiler',
  '/___proxy_subdomain_whm',
  '/___proxy_subdomain_cpanel',
  '/config.json',
  '/config.yml',
  '/config.yaml',
  '/backup.zip',
  '/backup.sql',
  '/database.sql',
  '/dump.sql',
  '/cgi-bin',
  '/shell.php',
  '/phpmyadmin',
  '/pma',
  '/admin.php',
  '/adminer.php',
  '/manager/html',
  '/solr',
  '/elasticsearch',
  '/_cluster/health',
  '/_cat/indices',
  '/jenkins',
  '/nexus',
  '/management',
  '/swagger-ui.html',
  '/swagger-resources',
  '/openapi.json',
  '/api-docs',
  '/v3/api-docs',
].map((p) => p.toLowerCase());

const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function stripAnsi(str) {
  return String(str).replace(/\x1b\[[0-9;]*m/g, '');
}

function banner(lines) {
  const width = Math.max(...lines.map((l) => stripAnsi(l).length)) + 4;
  const top = `╭${'─'.repeat(width)}╮`;
  const bottom = `╰${'─'.repeat(width)}╯`;
  const body = lines
    .map((l) => `│  ${l}${' '.repeat(width - stripAnsi(l).length - 2)}│`)
    .join('\n');
  return `\n${top}\n${body}\n${bottom}\n`;
}

function isBotProbe(pathname) {
  const p = (pathname || '').toLowerCase();
  return BOT_PROBES.some(
    (probe) => p === probe || p.startsWith(probe + '/') || p.startsWith(probe + '.')
  );
}

const app = express();

app.set('trust proxy', true);

app.use((req, res, next) => {
  if (isBotProbe(req.path)) {
    logger.debug(`bot probe blocked: ${req.path} from ${req.ip}`);
    return res.status(404).json({
      success: false,
      error: 'Route not found',
      code: 'NOT_FOUND',
      path: req.originalUrl,
    });
  }
  next();
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()) : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', { stream: { write: (m) => logger.info(m.trim()) } }));
} else {
  app.use(morgan('dev'));
}

app.get('/__meta', (_req, res) => {
  res.json({
    ok: true,
    service: 'hdm-bridge-api',
    name: APP_NAME,
    version: VERSION,
    message: `${APP_NAME} — running`,
    urls: {
      app: APP_URL,
      admin: ADMIN_URL,
      client: CLIENT_URL,
      api: `${APP_URL}/api`,
    },
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    name: APP_NAME,
    version: VERSION,
    description: 'Enterprise Email Sending Platform API',
    status: 'running',
    docs: `${APP_URL}/api`,
    health: `${APP_URL}/health`,
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: `${APP_NAME} API`,
    version: VERSION,
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
  const dbUp = mongoose.connection.readyState === 1;

  let redisUp = false;
  try {
    const redis = getRedisClient();
    await redis.ping();
    redisUp = true;
  } catch {}

  const health = {
    ok: dbUp,
    status: dbUp ? 'healthy' : 'degraded',
    name: APP_NAME,
    version: VERSION,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
    },
    urls: {
      app: APP_URL,
      admin: ADMIN_URL,
      client: CLIENT_URL,
    },
    dependencies: {
      mongodb: dbUp ? 'up' : 'down',
      redis: redisUp ? 'up' : 'down',
    },
  };

  res.status(dbUp ? 200 : 503).json(health);
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

async function start() {
  process.stdout.write(
    banner([
      `${C.bold}${C.cyan}${APP_NAME}${C.reset}`,
      `${C.dim}version:${C.reset} ${VERSION}`,
      `${C.dim}env:${C.reset}     ${process.env.NODE_ENV || 'development'}`,
      `${C.dim}port:${C.reset}    ${PORT}`,
      `${C.dim}api:${C.reset}     ${APP_URL}/api`,
      `${C.dim}admin:${C.reset}   ${ADMIN_URL}`,
      `${C.dim}client:${C.reset}  ${CLIENT_URL}`,
      `${C.dim}keepalive:${C.reset} ${process.env.KEEP_ALIVE_ENABLED === 'true' ? C.green + 'ON' + C.reset : C.yellow + 'OFF' + C.reset}`,
      `${C.dim}mode:${C.reset}    ${C.yellow}API-only${C.reset}`,
    ])
  );

  try {
    await connectDB();
  } catch (err) {
    logger.error('boot failed: mongodb — ' + err.message);
    console.error('\nFailed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  try {
    await connectRedis();
  } catch (err) {
    logger.warn('boot: redis failed — continuing without cache');
  }

  const server = app.listen(PORT, () => {
    logger.info(
      `\n${C.green}${C.bold}✔ Ready${C.reset}\n` +
        `   ${C.dim}api:${C.reset}      ${C.cyan}${APP_URL}/api${C.reset}\n` +
        `   ${C.dim}admin:${C.reset}    ${C.cyan}${ADMIN_URL}/admin/api${C.reset}\n` +
        `   ${C.dim}health:${C.reset}   ${C.cyan}${APP_URL}/health${C.reset}\n`
    );

    try {
      startEmailWorker();
      logger.info('email worker started');
    } catch (err) {
      logger.error('email worker failed: ' + err.message);
    }

    try {
      startSubscriptionWorker();
      logger.info('subscription worker started');
    } catch (err) {
      logger.error('subscription worker failed: ' + err.message);
    }

    try {
      startKeepAlive();
    } catch (err) {
      logger.error('keepAlive failed: ' + err.message);
    }

    console.log(`${C.green}${C.bold}   Ready to send emails!${C.reset}\n`);
  });

  const shutdown = async (signal) => {
    logger.warn(`shutdown: ${signal}`);

    try {
      stopKeepAlive();
    } catch {}

    server.close(async () => {
      try {
        const redis = getRedisClient();
        await redis.quit();
      } catch {}

      try {
        await mongoose.connection.close();
      } catch {}

      logger.info('shutdown complete');
      process.exit(0);
    });

    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGUSR2', () => shutdown('SIGUSR2'));

  process.on('unhandledRejection', (reason) => {
    logger.error('unhandledRejection: ' + (reason && reason.message ? reason.message : String(reason)));
  });

  process.on('uncaughtException', (err) => {
    logger.error('uncaughtException: ' + err.message);
    shutdown('UNCAUGHT_EXCEPTION');
  });
}

start();