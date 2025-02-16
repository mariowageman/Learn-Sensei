import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { authHandler } from "./auth";
import path from "path";

console.log('Starting server initialization...');

const app = express();
console.log('Express app created');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
console.log('Basic middleware configured');

// Add auth middleware before other routes
console.log('Setting up auth middleware...');
app.use(authHandler);
console.log('Auth middleware configured');

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});
console.log('Request logging middleware configured');

(async () => {
  try {
    console.log('Registering routes...');
    const server = registerRoutes(app);
    console.log('Routes registered successfully');

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error('Error handler caught:', err);
      res.status(status).json({ message });
      throw err;
    });

    // Serve static files after routes are registered
    console.log('Setting up static file serving...');
    app.use(express.static(path.join(process.cwd(), 'public'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
        }
      }
    }));

    app.use('/public', express.static(path.join(process.cwd(), 'client', 'public'), {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
        }
      }
    }));
    console.log('Static file serving configured');

    // Get port from environment or use fallback ports
    const PORT = process.env.PORT || 3000;
    console.log(`Attempting to start server on port ${PORT}...`);

    try {
      await new Promise((resolve, reject) => {
        server.listen(PORT, "0.0.0.0", () => {
          console.log(`Server successfully started and listening on port ${PORT}`);
          resolve(true);
        }).on('error', (err: any) => {
          console.error('Server error:', err);
          reject(err);
        });
      });

      // Server started successfully, now set up Vite
      if (app.get("env") === "development") {
        console.log('Setting up Vite in development mode...');
        await setupVite(app, server);
        console.log('Vite setup complete');
      } else {
        console.log('Setting up static serving in production mode...');
        serveStatic(app);
        console.log('Static serving setup complete');
      }

      console.log('Server initialization complete - ready to handle requests');
    } catch (error) {
      console.error('Fatal error starting server:', error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Fatal server error:', error);
    process.exit(1);
  }
})();