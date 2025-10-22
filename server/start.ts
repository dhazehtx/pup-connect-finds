import { setupApp } from './index';

const PORT = Number(process.env.PORT) || 5000;

(async () => {
  const server = await setupApp();
  
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on 0.0.0.0:${PORT}`);
  });
})();
