import { Server } from 'http';
import { createServer, proxy } from 'aws-serverless-express';
import { Context, Handler } from 'aws-lambda';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

let cachedServer: Server;

async function bootstrapServer(): Promise<Server> {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);
    await app.init();
    cachedServer = createServer(app.getHttpAdapter().getInstance());
  }
  return cachedServer;
}

export const handler: Handler = async (event: any, context: Context) => {
  const server = await bootstrapServer();
  return proxy(server, event, context, 'PROMISE').promise;
};
