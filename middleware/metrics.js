const promClient = require('prom-client');
const os = require('os');

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'easyrent-backend',
  version: process.env.APP_VERSION || '1.0.0'
});

// Enable the collection of default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// ===== HTTP PERFORMANCE METRICS =====

// HTTP Request Duration (Response Times)
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]
});

// HTTP Request Count (Request Rates)
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Error Rate Tracking
const httpRequestErrors = new promClient.Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'status_code', 'error_type']
});

// Active Connections
const activeConnections = new promClient.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Request Size
const httpRequestSize = new promClient.Histogram({
  name: 'http_request_size_bytes',
  help: 'Size of HTTP requests in bytes',
  labelNames: ['method', 'route'],
  buckets: [100, 1000, 10000, 100000, 1000000]
});

// Response Size
const httpResponseSize = new promClient.Histogram({
  name: 'http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [100, 1000, 10000, 100000, 1000000]
});

// ===== DATABASE PERFORMANCE METRICS =====

// Database Connection Pool
const dbConnectionsActive = new promClient.Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections'
});

const dbConnectionsIdle = new promClient.Gauge({
  name: 'database_connections_idle',
  help: 'Number of idle database connections'
});

const dbConnectionsTotal = new promClient.Gauge({
  name: 'database_connections_total',
  help: 'Total number of database connections'
});

// Database Query Performance
const dbQueryDuration = new promClient.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Database query execution time',
  labelNames: ['operation', 'table', 'status'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

const dbQueriesTotal = new promClient.Counter({
  name: 'database_queries_total',
  help: 'Total database queries executed',
  labelNames: ['operation', 'table', 'status']
});

// ===== SYSTEM PERFORMANCE METRICS =====

// Memory Usage Percentage
const memoryUsagePercent = new promClient.Gauge({
  name: 'memory_usage_percent',
  help: 'Memory usage as percentage'
});

// CPU Usage Percentage
const cpuUsagePercent = new promClient.Gauge({
  name: 'cpu_usage_percent',
  help: 'CPU usage as percentage'
});

// Event Loop Lag
const eventLoopLag = new promClient.Gauge({
  name: 'nodejs_event_loop_lag_seconds',
  help: 'Event loop lag in seconds'
});

// Service Health
const serviceHealth = new promClient.Gauge({
  name: 'service_health',
  help: 'Service health status (1 = healthy, 0 = unhealthy)',
  labelNames: ['service_name']
});

// ===== API PERFORMANCE METRICS =====

// API Endpoint Request Count
const apiEndpointRequests = new promClient.Counter({
  name: 'api_endpoint_requests_total',
  help: 'Total requests per API endpoint',
  labelNames: ['endpoint', 'method']
});

// API Endpoint Response Time
const apiEndpointDuration = new promClient.Histogram({
  name: 'api_endpoint_duration_seconds',
  help: 'API endpoint response time',
  labelNames: ['endpoint', 'method', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5]
});

// API Endpoint Usage (popularity tracking)
const apiEndpointUsage = new promClient.Counter({
  name: 'api_endpoint_usage_total',
  help: 'Usage count per API endpoint for popularity tracking',
  labelNames: ['endpoint', 'method', 'status_code']
});

// Register all metrics
const metrics = [
  httpRequestDuration,
  httpRequestsTotal,
  httpRequestErrors,
  activeConnections,
  httpRequestSize,
  httpResponseSize,
  dbConnectionsActive,
  dbConnectionsIdle,
  dbConnectionsTotal,
  dbQueryDuration,
  dbQueriesTotal,
  memoryUsagePercent,
  cpuUsagePercent,
  eventLoopLag,
  serviceHealth,
  apiEndpointRequests,
  apiEndpointDuration,
  apiEndpointUsage
];

metrics.forEach(metric => register.registerMetric(metric));

// ===== MIDDLEWARE FUNCTIONS =====

// Main metrics middleware
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  const startUsage = process.cpuUsage();
  
  // Track active connections
  activeConnections.inc();
  
  // Track request size (excluding metrics endpoint)
  if (req.path !== '/metrics') {
    const requestSize = parseInt(req.get('content-length')) || 0;
    httpRequestSize.observe({
      method: req.method,
      route: req.route?.path || req.path
    }, requestSize);
  }
  
  res.on('finish', () => {
    // Skip metrics endpoint from business metrics
    if (req.path === '/metrics') {
      activeConnections.dec();
      return;
    }
    
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    };
    
    // Record request duration and count
    httpRequestDuration.observe(labels, duration);
    httpRequestsTotal.inc(labels);
    
    // Track API endpoint metrics (excluding metrics endpoint)
    apiEndpointRequests.inc({
      endpoint: req.route?.path || req.path,
      method: req.method
    });
    
    apiEndpointDuration.observe({
      endpoint: req.route?.path || req.path,
      method: req.method,
      status_code: res.statusCode
    }, duration);
    
    // Track API endpoint usage (popularity)
    apiEndpointUsage.inc({
      endpoint: req.route?.path || req.path,
      method: req.method,
      status_code: res.statusCode
    });
    
    // Track response size
    const responseSize = parseInt(res.get('content-length')) || 0;
    httpResponseSize.observe(labels, responseSize);
    
    // Track errors
    if (res.statusCode >= 400) {
      const errorType = res.statusCode >= 500 ? 'server_error' : 'client_error';
      httpRequestErrors.inc({
        ...labels,
        error_type: errorType
      });
    }
    
    // Decrease active connections
    activeConnections.dec();
  });
  
  next();
};

// Database metrics helper
const trackDatabaseQuery = (operation, table, queryFunction) => {
  return async (...args) => {
    const start = Date.now();
    try {
      const result = await queryFunction(...args);
      const duration = (Date.now() - start) / 1000;
      
      dbQueryDuration.observe({
        operation,
        table,
        status: 'success'
      }, duration);
      
      dbQueriesTotal.inc({
        operation,
        table,
        status: 'success'
      });
      
      return result;
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      
      dbQueryDuration.observe({
        operation,
        table,
        status: 'error'
      }, duration);
      
      dbQueriesTotal.inc({
        operation,
        table,
        status: 'error'
      });
      
      throw error;
    }
  };
};

// Track previous CPU usage for percentage calculation
let lastCpuUsage = process.cpuUsage();
let lastCpuTime = Date.now();

// System metrics updater
const updateSystemMetrics = () => {
  // Update memory usage percentage
  const memUsage = process.memoryUsage();
  const totalMemory = os.totalmem();
  const memoryPercent = (memUsage.rss / totalMemory) * 100;
  memoryUsagePercent.set(memoryPercent);
  
  // Calculate actual CPU usage percentage
  const currentCpuUsage = process.cpuUsage(lastCpuUsage);
  const currentTime = Date.now();
  const timeDiff = currentTime - lastCpuTime;
  
  // Calculate CPU percentage over the time period
  const cpuPercent = ((currentCpuUsage.user + currentCpuUsage.system) / 1000) / timeDiff * 100;
  cpuUsagePercent.set(Math.min(cpuPercent, 100)); // Cap at 100%
  
  // Update tracking variables
  lastCpuUsage = process.cpuUsage();
  lastCpuTime = currentTime;
  
  // Update event loop lag
  const start = process.hrtime.bigint();
  setImmediate(() => {
    const lag = Number(process.hrtime.bigint() - start) / 1e9;
    eventLoopLag.set(lag);
  });
  
  // Update service health (basic health check)
  serviceHealth.set({ service_name: 'easyrent-backend' }, 1);
};

// Update system metrics every 10 seconds
setInterval(updateSystemMetrics, 10000);
updateSystemMetrics(); // Initial update

// Database connection monitoring (call this from your DB setup)
const updateDatabaseMetrics = (pool) => {
  if (pool && pool.totalCount !== undefined) {
    dbConnectionsTotal.set(pool.totalCount);
    dbConnectionsActive.set(pool.idleCount ? pool.totalCount - pool.idleCount : 0);
    dbConnectionsIdle.set(pool.idleCount || 0);
  }
};

module.exports = {
  register,
  metricsMiddleware,
  trackDatabaseQuery,
  updateDatabaseMetrics,
  updateSystemMetrics,
  // Individual metrics for direct access
  httpRequestDuration,
  httpRequestsTotal,
  httpRequestErrors,
  activeConnections,
  dbConnectionsActive,
  dbConnectionsIdle,
  dbConnectionsTotal,
  dbQueryDuration,
  memoryUsagePercent,
  cpuUsagePercent,
  serviceHealth,
  apiEndpointUsage
};