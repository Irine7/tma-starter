import { Router, Request, Response, IRouter } from 'express';
import { HealthResponse } from '@tma/shared';

const router: IRouter = Router();

const startTime = Date.now();

/**
 * GET /health
 * Health check endpoint for monitoring and load balancers
 */
router.get('/', (_req: Request, res: Response) => {
  const response: HealthResponse = {
    status: 'ok',
    timestamp: Date.now(),
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };

  res.json(response);
});

/**
 * GET /health/ready
 * Readiness probe - check if the service is ready to accept traffic
 */
router.get('/ready', (_req: Request, res: Response) => {
  // Add any readiness checks here (database connection, etc.)
  res.json({
    ready: true,
    timestamp: Date.now(),
  });
});

/**
 * GET /health/live
 * Liveness probe - check if the service is alive
 */
router.get('/live', (_req: Request, res: Response) => {
  res.json({
    alive: true,
    timestamp: Date.now(),
  });
});

export default router;
