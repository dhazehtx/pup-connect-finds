import { IncomingWebhook } from '@slack/webhook';
import { Resend } from 'resend';
import { storage } from '../storage';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const slackWebhook = process.env.SLACK_WEBHOOK_URL ? new IncomingWebhook(process.env.SLACK_WEBHOOK_URL) : null;

export async function checkInventoryAlerts() {
  try {
    const lowStockProducts = await storage.getLowStockProducts();
    
    if (lowStockProducts.length === 0) {
      console.log('No low stock products found');
      return;
    }

    console.log(`Found ${lowStockProducts.length} low stock products`);

    // Send email alert
    if (resend) {
      await resend.emails.send({
        from: 'alerts@my-pup.com',
        to: ['ops@my-pup.com'],
        subject: `🚨 Low Stock Alert - ${lowStockProducts.length} Products`,
        html: `
          <h2>Low Stock Alert</h2>
          <p>The following products have low inventory (< 5 units):</p>
          <ul>
            ${lowStockProducts.map(product => 
              `<li><strong>${product.name}</strong> - ${product.inventory_qty} units remaining</li>`
            ).join('')}
          </ul>
          <p>Please restock these items as soon as possible.</p>
        `
      });
      console.log('Low stock email sent');
    }

    // Send Slack alert
    if (slackWebhook) {
      await slackWebhook.send({
        text: `🚨 Low Stock Alert - ${lowStockProducts.length} Products`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Low Stock Alert*\n${lowStockProducts.length} products have low inventory (< 5 units):`
            }
          },
          ...lowStockProducts.map(product => ({
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `• *${product.name}* - ${product.inventory_qty} units remaining`
            }
          }))
        ]
      });
      console.log('Low stock Slack alert sent');
    }

    // Mark products as alerted
    for (const product of lowStockProducts) {
      await storage.markProductAsAlerted(product.id);
    }

  } catch (error) {
    console.error('Error checking inventory alerts:', error);
  }
}