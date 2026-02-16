import cors from 'cors';

/**
 * CORS Middleware Configuration
 * Allows the frontend to communicate with the API during development
 */
export const corsMiddleware = () => {
	const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
		'http://localhost:3000',
	];

	return cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (mobile apps, Postman, etc.)
			if (!origin) {
				return callback(null, true);
			}

			if (allowedOrigins.includes(origin)) {
				return callback(null, true);
			}

			// Allow Vercel deployments (production & preview)
			if (origin.includes('vercel.app')) {
				return callback(null, true);
			}

			// In development, allow localhost and tunnel origins
			if (process.env.NODE_ENV !== 'production') {
				if (
					origin.includes('localhost') ||
					origin.includes('ngrok-free.app') ||
					origin.includes('ngrok.io') ||
					origin.includes('trycloudflare.com')
				) {
					return callback(null, true);
				}
			}

			callback(new Error(`Origin ${origin} not allowed by CORS`));
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data', 'ngrok-skip-browser-warning'],
	});
};
