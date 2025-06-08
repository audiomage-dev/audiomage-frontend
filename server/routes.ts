import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import express from 'express';
import path from 'path';

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve attached assets with proper CORS headers
  app.use(
    '/attached_assets',
    express.static(path.join(process.cwd(), 'attached_assets'), {
      setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      },
    })
  );

  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
