import crypto from 'crypto';

// Server-side session secret for HMAC signature verification
const SESSION_SECRET = process.env.SESSION_SECRET || 'gadanyi-vendeghaz-super-secret-key-123456';

export function createSessionToken(username: string): string {
  // Create a payload: username + expiration timestamp (24 hours)
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24; 
  const payload = JSON.stringify({ username, expiresAt });
  
  // Sign the payload
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payload)
    .digest('hex');
    
  return `${Buffer.from(payload).toString('base64')}.${signature}`;
}

export function verifySessionToken(token: string): string | null {
  try {
    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return null;
    
    const payload = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const expectedSignature = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payload)
      .digest('hex');
      
    if (signature !== expectedSignature) return null;
    
    const data = JSON.parse(payload);
    if (data.expiresAt < Date.now()) return null; // expired
    
    return data.username;
  } catch {
    return null;
  }
}
