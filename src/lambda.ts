import configureServerlessExpress from '@vendia/serverless-express';
import { app } from './app.js';
import { initConfig } from './config/index.js';
import { initPrisma } from './utils/prisma.js';

const setup = async () => {
  await initConfig();
  initPrisma();
  // @ts-ignore
  return configureServerlessExpress({ app });
};

let serverlessExpressInstance: any;

export const handler = async (event: any, context: any) => {
  if (!serverlessExpressInstance) {
    serverlessExpressInstance = await setup();
  }
  return serverlessExpressInstance(event, context);
};
