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

export async function sendVerificationCode(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!serviceSid) {
      throw new Error('TWILIO_VERIFY_SERVICE_SID is not configured');
    }

    const client = await getTwilioClient();

    await client.verify.v2
      .services(serviceSid)
      .verifications.create({
        to: phone,
        channel: 'sms',
        locale: 'tr',
      });

    console.log(`Verification code sent to ${phone}`);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send verification code:', error);
    return { success: false, error: error.message || 'SMS gonderilemedi' };
  }
}

export async function verifyCode(phone: string, code: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
    if (!serviceSid) {
      throw new Error('TWILIO_VERIFY_SERVICE_SID is not configured');
    }

    const client = await getTwilioClient();

    const verificationCheck = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({
        to: phone,
        code: code,
      });

    if (verificationCheck.status === 'approved') {
      return { valid: true };
    }

    return { valid: false, error: 'Dogrulama kodu hatali.' };
  } catch (error: any) {
    console.error('Verification check error:', error);
    if (error.code === 20404) {
      return { valid: false, error: 'Dogrulama kodu bulunamadi veya suresi doldu. Lutfen yeni kod isteyin.' };
    }
    return { valid: false, error: error.message || 'Dogrulama hatasi' };
  }
}
