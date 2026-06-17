import 'dotenv/config';
import { runEngagementRateUpdater } from './services/engagementService.js';

runEngagementRateUpdater(true).then(console.log).catch(console.error).finally(() => process.exit(0));
