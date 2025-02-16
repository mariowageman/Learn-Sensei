import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";
import { sessionConfig } from "./auth";
import session from 'express-session';

// Add startup logging
console.log('Starting server initialization...');
console.log('Environment variables check:');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('- AUTH_SECRET:', process.env.AUTH_SECRET ? 'Set' : 'Not set');
console.log('- NODE_ENV:', process.env.NODE_ENV);

const app = express();

// Basic middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware - properly wrapped with express-session
app.use(session(sessionConfig));

// Serve static files from public directory with proper MIME types
app.use(express.static(path.join(process.cwd(), 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));

// Also serve static files from client/public directory
app.use('/public', express.static(path.join(process.cwd(), 'client', 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));

// Logging middleware
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

// Wrap server startup in try-catch for better error handling
(async () => {
  try {
    console.log('Setting up routes and server...');
    const server = registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Error in middleware:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
    });

    // Development mode setup with Vite
    if (process.env.NODE_ENV === 'development') {
      console.log('Setting up Vite in development mode...');
      try {
        await setupVite(app, server);
        console.log('Vite setup completed successfully');
      } catch (viteError) {
        console.error('Error setting up Vite:', viteError);
        process.exit(1);
      }
    } else {
      console.log('Setting up static serving in production mode...');
      serveStatic(app);
    }

    const PORT = 5000;
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server started successfully on port ${PORT}`);
    });
  } catch (error) {
    console.error('Fatal error during server startup:', error);
    process.exit(1);
  }
})().catch(err => {
  console.error('Unhandled promise rejection during startup:', err);
  process.exit(1);
});