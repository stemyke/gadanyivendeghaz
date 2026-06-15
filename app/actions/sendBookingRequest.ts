'use server';

import { createTransport } from 'nodemailer';

interface BookingData {
  name: string;
  email: string;
  guests: number;
  startDate: string;
  endDate: string;
  nights: number;
  totalPrice: string;
}

export async function sendBookingRequest(data: BookingData) {
  const { name, email, guests, startDate, endDate, nights, totalPrice } = data;

  // SMTP adatok beolvasása a környezeti változókból
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_EMAIL_TO } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_EMAIL_TO) {
    console.error('Hiányzó SMTP konfiguráció a .env fájlban.');
    return { success: false, error: 'Szerveroldali konfigurációs hiba.' };
  }

  const transporter = createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `"Gadányi Vendégház Weboldal" <${SMTP_USER}>`,
    to: SMTP_EMAIL_TO,
    replyTo: email, // Így a "Válasz" gomb a felhasználó címére küldi a választ
    subject: `Új ajánlatkérés érkezett - ${name}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2 style="color: #1e3a8a;">Új ajánlatkérés érkezett a weboldalról</h2>
        <p>A következő adatokkal küldtek ajánlatkérést:</p>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>Név:</strong> ${name}</li>
          <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
        </ul>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <h3 style="color: #1e3a8a;">Foglalás részletei</h3>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>Érkezés:</strong> ${startDate}</li>
          <li><strong>Távozás:</strong> ${endDate}</li>
          <li><strong>Éjszakák száma:</strong> ${nights}</li>
          <li><strong>Vendégek száma:</strong> ${guests} fő</li>
          <li style="margin-top: 10px;"><strong>Kalkulált végösszeg:</strong> <strong style="font-size: 1.1em;">${totalPrice}</strong></li>
        </ul>
        <p style="margin-top: 25px; font-size: 0.9em; color: #555;">
          Ez egy automatikusan generált e-mail. Kérjük, vedd fel a kapcsolatot a vendéggel a megadott e-mail címen.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Hiba az e-mail küldésekor:', error);
    return { success: false, error: 'Az e-mail küldése sikertelen.' };
  }
}
