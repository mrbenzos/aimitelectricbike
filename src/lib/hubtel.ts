/**
 * M.SNIFF BUSINESS HUB - AIMIT ELECTRIC BICYCLES
 * SMS NOTIFICATION & 2FA ENGINE (Powered by Vynfy SMS API)
 * Handles automated SMS alerts to owner & customers with fallback support.
 */

export interface SendSMSOptions {
  to: string;
  message: string;
  senderId?: string;
}

export interface HubtelSMSResult {
  success: boolean;
  messageId?: string;
  status?: string;
  error?: string;
  mock?: boolean;
  provider?: 'vynfy' | 'hubtel' | 'mock';
  balanceRemaining?: number;
}

// In-memory record for diagnostics & admin ledger
export const SMS_LOGS: Array<{
  timestamp: string;
  to: string;
  sender: string;
  message: string;
  status: string;
  provider?: string;
}> = [];

/**
 * Format phone number to international Ghana format (e.g. 233XXXXXXXXX)
 */
export function formatGhanaPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '233' + cleaned.substring(1);
  } else if (cleaned.startsWith('+233')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Low-level SMS sender.
 * Primary: Vynfy SMS REST API (https://sms.vynfy.com/api/v1/send)
 * Secondary: Hubtel API v1 (if configured)
 * Dev Fallback: Mock logger
 */
export async function sendAlertSMS({
  to,
  message,
  senderId,
}: SendSMSOptions): Promise<HubtelSMSResult> {
  const vynfyApiKey = process.env.VYNFY_API_KEY;
  const hubtelClientId = process.env.HUBTEL_CLIENT_ID;
  const hubtelClientSecret = process.env.HUBTEL_CLIENT_SECRET;
  const defaultSender = process.env.SENDER_ID || 'AIMIT EBIKE';
  const finalSender = senderId || defaultSender;
  const formattedPhone = formatGhanaPhone(to);

  // 1. PRIMARY PROVIDER: VYNFY SMS API
  if (vynfyApiKey) {
    try {
      const endpoint = process.env.VYNFY_API_URL || 'https://sms.vynfy.com/api/v1/send';
      const payload = {
        sender: finalSender,
        recipients: [formattedPhone],
        message: message,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'X-API-Key': vynfyApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const taskId = data.data?.task_id || data.task_id;
        const remaining = data.balance?.remaining;
        const logEntry = {
          timestamp: new Date().toISOString(),
          to: formattedPhone,
          sender: finalSender,
          message,
          status: 'DELIVERED',
          provider: 'vynfy',
        };
        SMS_LOGS.unshift(logEntry);
        console.log('[VYNFY SMS SENT SUCCESS]', {
          to: formattedPhone,
          sender: finalSender,
          taskId,
          remainingCredits: remaining,
        });

        return {
          success: true,
          messageId: taskId,
          status: 'DELIVERED',
          provider: 'vynfy',
          balanceRemaining: remaining,
        };
      } else {
        console.error('[VYNFY SMS API ERROR]', data);
        const errorMsg = data.message || data.error || 'Failed to send SMS via Vynfy';
        return {
          success: false,
          error: errorMsg,
          provider: 'vynfy',
        };
      }
    } catch (error: any) {
      console.error('[VYNFY NETWORK EXCEPTION]', error);
      return {
        success: false,
        error: error.message || 'Network exception calling Vynfy SMS API',
        provider: 'vynfy',
      };
    }
  }

  // 2. SECONDARY / LEGACY PROVIDER: HUBTEL API v1
  if (hubtelClientId && hubtelClientSecret) {
    try {
      const authHeader = 'Basic ' + Buffer.from(`${hubtelClientId}:${hubtelClientSecret}`).toString('base64');
      const url = new URL('https://sms.hubtel.com/v1/messages/send');
      url.searchParams.append('From', finalSender);
      url.searchParams.append('To', formattedPhone);
      url.searchParams.append('Content', message);

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: { Authorization: authHeader },
      });

      const data = await response.json();

      if (response.ok && (data.status === 0 || data.Status === 0 || data.messageId)) {
        const logEntry = {
          timestamp: new Date().toISOString(),
          to: formattedPhone,
          sender: finalSender,
          message,
          status: 'DELIVERED',
          provider: 'hubtel',
        };
        SMS_LOGS.unshift(logEntry);
        return {
          success: true,
          messageId: data.messageId || data.MessageId,
          status: 'DELIVERED',
          provider: 'hubtel',
        };
      } else {
        console.error('[HUBTEL ERROR RESPONSE]', data);
        return {
          success: false,
          error: data.message || data.Message || 'Failed to send SMS via Hubtel',
          provider: 'hubtel',
        };
      }
    } catch (error: any) {
      console.error('[HUBTEL NETWORK ERROR]', error);
      return {
        success: false,
        error: error.message || 'Network exception calling Hubtel API',
        provider: 'hubtel',
      };
    }
  }

  // 3. MOCK DELIVERY (When no API keys are provided in dev)
  const logEntry = {
    timestamp: new Date().toISOString(),
    to: formattedPhone,
    sender: finalSender,
    message,
    status: 'MOCK_SENT (Set VYNFY_API_KEY for live SMS)',
    provider: 'mock',
  };
  SMS_LOGS.unshift(logEntry);
  console.log('[SMS MOCK SENT]', logEntry);
  return {
    success: true,
    status: 'MOCK_DELIVERED',
    mock: true,
    provider: 'mock',
  };
}

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// PREDEFINED BUSINESS ALERT TRIGGERS
// -----------------------------------------------------------------------------

const OWNER_PHONE = process.env.OWNER_PHONE || '233242365706';

/**
 * Get list of administrative notification phones
 */
function getAdminNotificationPhones(): string[] {
  const configured = process.env.ADMIN_NOTIFY_PHONES;
  if (configured) {
    return configured.split(',').map((p) => p.trim()).filter(Boolean);
  }
  return [
    OWNER_PHONE,
    process.env.ADMIN_PHONE_BENZOS || '0538973984',
  ];
}

/**
 * Broadcast an administrative alert message to all store admins
 */
async function sendAdminBroadcast(message: string) {
  const phones = getAdminNotificationPhones();
  return await Promise.all(
    phones.map((phone) =>
      sendAlertSMS({
        to: phone,
        message,
        senderId: 'AIMIT EBIKE',
      })
    )
  );
}

/**
 * 1. On bike stock_qty <= 2
 */
export async function alertLowStock(modelName: string, qtyLeft: number) {
  const message = `LOW STOCK ALERT: AIMIT ${modelName} only ${qtyLeft} left in stock. Restock required. - AIMIT EBIKE`;
  const results = await sendAdminBroadcast(message);
  return results[0];
}

/**
 * 2. On bike marked sold_out / deleted / price changed
 */
export async function alertBikeAction(modelName: string, action: string) {
  const time = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const message = `AIMIT EBIKE INVENTORY: ${modelName} marked ${action} by Admin at ${time}. - AIMIT EBIKE`;
  const results = await sendAdminBroadcast(message);
  return results[0];
}

/**
 * 3. On new order created (Sends to Owners/Admins AND Customer)
 */
export async function alertNewOrder(orderData: {
  modelName: string;
  qty: number;
  deliveryHub: string;
  customerPhone: string;
  customerName: string;
  totalPrice: number;
}) {
  // SMS to Store Admins
  const adminMsg = `NEW ORDER: ${orderData.modelName} x${orderData.qty} to ${orderData.deliveryHub} | Customer: ${orderData.customerName} (${orderData.customerPhone}) | Total: GHS ${orderData.totalPrice}. - AIMIT EBIKE`;
  const adminPromise = sendAdminBroadcast(adminMsg);

  // SMS to Customer
  const customerSender = process.env.SENDER_ID_CUSTOMER || 'AIMIT EBIKE';
  const customerMsg = `Hello ${orderData.customerName}, your order for ${orderData.modelName} (Delivery to ${orderData.deliveryHub}) has been received! Our hub representative will call you shortly. - AIMIT EBIKE`;
  const customerPromise = sendAlertSMS({
    to: orderData.customerPhone,
    message: customerMsg,
    senderId: customerSender,
  });

  const [adminRes, customerRes] = await Promise.all([adminPromise, customerPromise]);
  return { ownerRes: adminRes[0], customerRes };
}

/**
 * 4. On new test ride
 */
export async function alertNewTestRide(data: {
  customerName: string;
  customerPhone: string;
  hub: string;
  date: string;
  bikeInterest?: string;
}) {
  const message = `NEW TEST RIDE: ${data.customerName} (${data.customerPhone}) booked at ${data.hub} on ${data.date} for ${data.bikeInterest || 'AIMIT E-Bike'}. - AIMIT EBIKE`;
  const results = await sendAdminBroadcast(message);
  return results[0];
}

/**
 * 5. Admin 2FA OTP
 */
export async function sendAdminOTP(phoneOrEmail: string, code: string) {
  const adminDirectory: Record<string, string> = {
    'benzosjeff430@gmail.com': process.env.ADMIN_PHONE_BENZOS || '0538973984',
    'admin@msniff.com': process.env.ADMIN_PHONE || '233242365706',
  };

  const inputKey = (phoneOrEmail || '').trim().toLowerCase();
  const targetPhone = adminDirectory[inputKey] || (inputKey.includes('@') ? (process.env.ADMIN_PHONE || OWNER_PHONE) : phoneOrEmail);

  const message = `Your AIMIT E-BIKES admin verification code is: ${code}. Valid for 5 minutes.`;
  return await sendAlertSMS({
    to: targetPhone,
    message,
    senderId: 'AIMIT EBIKE',
  });
}
