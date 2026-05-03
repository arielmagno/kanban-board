import 'dotenv/config';
import { createServer } from 'http';
import { createApp } from './app';
import { initSocket } from './socket';

const PORT = process.env.PORT ?? 4000;

const app = createApp();
const httpServer = createServer(app);

initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
