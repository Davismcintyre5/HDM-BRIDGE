const logger = require('../../utils/logger');

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

function isBotProbe(pathname) {
  const p = (pathname || '').toLowerCase();
  return BOT_PROBES.some(
    (probe) => p === probe || p.startsWith(probe + '/') || p.startsWith(probe + '.')
  );
}

function botProtection(req, res, next) {
  if (isBotProbe(req.path)) {
    logger.debug(`Bot probe blocked: ${req.path} from ${req.ip}`);
    return res.status(404).json({
      success: false,
      error: 'Route not found',
      code: 'NOT_FOUND',
      path: req.originalUrl,
    });
  }
  next();
}

module.exports = botProtection;
module.exports.botProtection = botProtection;
module.exports.isBotProbe = isBotProbe;
module.exports.BOT_PROBES = BOT_PROBES;