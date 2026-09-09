import { createApp } from './app';
import { ENV } from './config/env';
import { checkPrismaConnection } from './lib/prisma';

const app = createApp();

const server = app.listen(ENV.PORT, async () => {
  console.log(`====================================================`);
  console.log(` MediMatch Server listening on http://localhost:${ENV.PORT}`);
  console.log(` Mode: ${ENV.NODE_ENV}`);
  console.log(`====================================================`);

  const dbConnected = await checkPrismaConnection();
  if (dbConnected) {
    console.log(` Database: PostgreSQL Connected via Prisma`);
  } else {
    console.log(` Database: In-memory resilient store active (Ready for Supabase)`);
  }
});

export default server;

