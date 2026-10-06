const logger = require('../utils/logger');

const FIRST_DELAY_MS = 60 * 1000;
const INTERVAL_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 10 * 1000;

let firstTimer = null;
let intervalTimer = null;

function isEnabled() {
  return process.env.KEEP_ALIVE_ENABLED === 'true';
}

function isVerbose() {
  return process.env.KEEP_ALIVE_VERBOSE === 'true';
}

async function pingHealth(options = {}) {
  const { forceLog = false } = options;
  const base = process.env.BASE_URL;
  if (!base) return;

  const url = base.replace(/\/+$/, '') + '/health';
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { method: 'GET', signal: controller.signal });
    const duration = Date.now() - started;

    if (!res.ok) {
      logger.warn('[keepAlive] GET ' + url + ' -> ' + res.status + ' in ' + duration + 'ms');
      return;
    }

    if (isVerbose() || forceLog) {
      logger.info('[keepAlive] GET ' + url + ' -> ' + res.status + ' in ' + duration + 'ms');
    }
  } catch (err) {
    const duration = Date.now() - started;
    const msg = err.name === 'AbortError' ? 'timeout after ' + duration + 'ms' : err.message;
    logger.warn('[keepAlive] GET ' + url + ' failed: ' + msg);
  } finally {
    clearTimeout(timeout);
  }
}

function startKeepAlive() {
  console.log('[keepAlive] startKeepAlive() CALLED. ENABLED=' + process.env.KEEP_ALIVE_ENABLED + ' BASE_URL=' + process.env.BASE_URL);

  if (!isEnabled()) {
    logger.info('[keepAlive] Disabled (KEEP_ALIVE_ENABLED != true)');
    return;
  }

  const base = process.env.BASE_URL;
  if (!base) {
    logger.warn('[keepAlive] BASE_URL is not set. Keep-alive disabled.');
    return;
  }

  if (firstTimer || intervalTimer) {
    logger.warn('[keepAlive] Already running');
    return;
  }

  logger.info(
    '[keepAlive] Enabled. First ping in 60s, then every 10m. Verbose logs ' +
    (isVerbose() ? 'on.' : 'off.')
  );

  firstTimer = setTimeout(() => {
    firstTimer = null;
    pingHealth({ forceLog: true }).catch(() => {});

    intervalTimer = setInterval(() => {
      pingHealth().catch(() => {});
    }, INTERVAL_MS);
  }, FIRST_DELAY_MS);
}

function stopKeepAlive() {
  if (firstTimer) {
    clearTimeout(firstTimer);
    firstTimer = null;
  }
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
  }
}

module.exports = { startKeepAlive, stopKeepAlive, pingHealth };