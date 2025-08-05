import * as cron from 'node-cron';
import { checkInventoryAlerts } from '../services/inventory-alert';

// Run inventory alerts check every hour
export function setupInventoryAlerts() {
  console.log('Setting up inventory alerts cron job...');
  
  // Run every hour at minute 0
  cron.schedule('0 * * * *', async () => {
    console.log('Running inventory alerts check...');
    await checkInventoryAlerts();
  }, {
    timezone: "America/New_York"
  });
  
  console.log('Inventory alerts cron job scheduled');
}