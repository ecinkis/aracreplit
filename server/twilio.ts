import twilio from 'twilio';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=twilio',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken,
      },
    }
  )
    .then((res) => res.json())
    .then((data) => data.items?.[0]);

  if (
    !connectionSettings ||
    !connectionSettings.settings.account_sid ||
    !connectionSettings.settings.api_key ||
    !connectionSettings.settings.api_key_secret
  ) {
    throw new Error('Twilio not connected');
  }
  return {
    accountSid: connectionSettings.settings.account_sid,
    apiKey: connectionSettings.settings.api_key,
    apiKeySecret: connectionSettings.settings.api_key_secret,
    phoneNumber: connectionSettings.settings.phone_number,
  };
}

export async function getTwilioClient() {
  const { accountSid, apiKey, apiKeySecret } = await getCredentials();
  return twilio(apiKey, apiKeySecret, { accountSid });
}

export async function getTwilioFromPhoneNumber() {
  const { phoneNumber } = await getCredentials();
  return phoneNumber;
}

const verificationCodes = new Map<string, { code: string; expiresAt: number; attempts: number }>();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationCode(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const code = generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    verificationCodes.set(phone, { code, expiresAt, attempts: 0 });

    const client = await getTwilioClient();
    const fromNumber = await getTwilioFromPhoneNumber();

    await client.messages.create({
      body: `TakasApp dogrulama kodunuz: ${code}. Bu kod 5 dakika gecerlidir.`,
      from: fromNumber,
      to: phone,
    });

    console.log(`Verification code sent to ${phone}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send verification code:', error);
    return { success: false, error: error.message || 'SMS gonderilemedi' };
  }
}

export function verifyCode(phone: string, code: string): { valid: boolean; error?: string } {
  const stored = verificationCodes.get(phone);

  if (!stored) {
    return { valid: false, error: 'Dogrulama kodu bulunamadi. Lutfen yeni kod isteyin.' };
  }

  if (Date.now() > stored.expiresAt) {
    verificationCodes.delete(phone);
    return { valid: false, error: 'Dogrulama kodu suresi doldu. Lutfen yeni kod isteyin.' };
  }

  stored.attempts += 1;
  if (stored.attempts > 5) {
    verificationCodes.delete(phone);
    return { valid: false, error: 'Cok fazla deneme yapildi. Lutfen yeni kod isteyin.' };
  }

  if (stored.code !== code) {
    return { valid: false, error: 'Dogrulama kodu hatali.' };
  }

  verificationCodes.delete(phone);
  return { valid: true };
}
