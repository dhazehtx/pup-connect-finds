import { setupApp } from './index';

console.log('[boot] starting server…');

const PORT = Number(process.env.PORT) || 5000;
const HOST = '0.0.0.0';

(async () => {
  const server = await setupApp();
  
  server.listen(PORT, HOST, () => {
    console.log(`[boot] Server listening on ${HOST}:${PORT}`);
  });
})();

// help catch silent failures
process.on('unhandledRejection', (e) => console.error('[boot] unhandledRejection', e));
process.on('uncaughtException', (e) => console.error('[boot] uncaughtException', e));
