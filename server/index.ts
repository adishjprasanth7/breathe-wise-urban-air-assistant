import 'dotenv/config';
import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 3001;
const app = createApp();

app.listen(PORT, () => {
  console.log(`BreatheWise API server listening on port ${PORT}`);
});
