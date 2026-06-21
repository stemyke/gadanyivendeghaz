'use server';

import prisma from '../../lib/prisma';
import { checkAuth } from './auth';
import { createTransport } from 'nodemailer';
import { Rooms } from '../../data/rooms';

export async function getBookedDates(roomId: number) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: 'accepted',
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    return bookings.map(b => ({
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to get booked dates:', error);
    return [];
  }
}

// Helper function to save a booking request into the database
async function saveBookingToDb(data: {
  roomId: number;
  startDate: Date;
  endDate: Date;
  name: string;
  email: string;
  guests: number;
  totalPrice: string;
}) {
  return await prisma.booking.create({
    data: {
      roomId: data.roomId,
      startDate: data.startDate,
      endDate: data.endDate,
      name: data.name,
      email: data.email,
      guests: data.guests,
      totalPrice: data.totalPrice,
      status: 'pending'
    }
  });
}

// Helper function to send email notification to admin via SMTP
async function sendBookingEmail(data: {
  name: string;
  email: string;
  roomName: string;
  startDate: Date;
  endDate: Date;
  guests: number;
  nights: number;
  totalPrice: string;
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_EMAIL_TO } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_EMAIL_TO) {
    console.error('Hiányzó SMTP konfiguráció a .env fájlban.');
    return false;
  }

  const transporter = createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
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
    replyTo: data.email,
    subject: `Új ajánlatkérés érkezett - ${data.name}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6;">
        <h2 style="color: #1e3a8a;">Új ajánlatkérés érkezett a weboldalról</h2>
        <p>A következő adatokkal küldtek ajánlatkérést:</p>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>Név:</strong> ${data.name}</li>
          <li><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></li>
          <li><strong>Szoba:</strong> ${data.roomName}</li>
        </ul>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <h3 style="color: #1e3a8a;">Foglalás részletei</h3>
        <ul style="list-style-type: none; padding: 0;">
          <li><strong>Érkezés:</strong> ${data.startDate.toLocaleDateString('hu-HU')}</li>
          <li><strong>Távozás:</strong> ${data.endDate.toLocaleDateString('hu-HU')}</li>
          <li><strong>Éjszakák száma:</strong> ${data.nights}</li>
          <li><strong>Vendégek száma:</strong> ${data.guests} fő</li>
          <li style="margin-top: 10px;"><strong>Kalkulált végösszeg:</strong> <strong style="font-size: 1.1em;">${data.totalPrice}</strong></li>
        </ul>
        <p style="margin-top: 25px; font-size: 0.9em; color: #555;">
          Ez egy automatikusan generált e-mail. Kérjük, kezeld a foglalást az admin felületen.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  return true;
}

export async function createBooking(data: {
  roomId: number;
  startDate: string; // ISO String
  endDate: string; // ISO String
  guests: number;
  lastName: string;
  firstName: string;
  email: string;
}) {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start >= end) {
    return { success: false, error: 'A távozás dátumának későbbinek kell lennie az érkezésnél!' };
  }

  // Check overlaps with accepted bookings
  const tolerance = Number(process.env.BOOKING_TOLERANCE || 0);
  const existingBookings = await prisma.booking.findMany({
    where: {
      roomId: data.roomId,
      status: 'accepted',
    }
  });

  for (const existing of existingBookings) {
    const eStart = new Date(existing.startDate);
    const eEnd = new Date(existing.endDate);
    eStart.setHours(0, 0, 0, 0);
    eEnd.setHours(0, 0, 0, 0);

    const overlapStart = start.getTime() < (eEnd.getTime() + tolerance * 24 * 60 * 60 * 1000);
    const overlapEnd = end.getTime() > eStart.getTime();

    if (overlapStart && overlapEnd) {
      return { success: false, error: 'A kiválasztott időpont már foglalt erre a szobára!' };
    }
  }

  const nights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const accommodationFee = nights * data.guests * 7500;
  const ifa = nights * data.guests * 500;
  const totalPrice = `${(accommodationFee + ifa).toLocaleString()} Ft`;

  const roomName = Rooms.find(r => r.id === data.roomId)?.name || `${data.roomId}. szoba`;

  try {
    // 1. Save booking request into DB (status: pending)
    await saveBookingToDb({
      roomId: data.roomId,
      startDate: start,
      endDate: end,
      name: `${data.lastName} ${data.firstName}`,
      email: data.email,
      guests: data.guests,
      totalPrice
    });

    // 2. Send email notification (currently commented out)
    /*
    await sendBookingEmail({
      name: `${data.lastName} ${data.firstName}`,
      email: data.email,
      roomName,
      startDate: start,
      endDate: end,
      guests: data.guests,
      nights,
      totalPrice
    });
    */

    return { success: true };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: 'Hiba történt a foglalási kérés feldoűlgozásakor.' };
  }
}

export async function getBookingsList() {
  const { isAuthenticated } = await checkAuth();
  if (!isAuthenticated) {
    throw new Error('Not authenticated');
  }

  try {
    const bookings = await prisma.booking.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return bookings.map(b => ({
      id: b.id,
      roomId: b.roomId,
      startDate: b.startDate.toISOString(),
      endDate: b.endDate.toISOString(),
      name: b.name,
      email: b.email,
      guests: b.guests,
      totalPrice: b.totalPrice,
      status: b.status,
      acceptedAt: b.acceptedAt ? b.acceptedAt.toISOString() : null,
      createdAt: b.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to get bookings:', error);
    return [];
  }
}

export async function updateBooking(
  bookingId: number,
  data: {
    status: string;
    startDate?: string;
    endDate?: string;
    guests?: number;
  }
) {
  const { isAuthenticated } = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Ehhez a művelethez be kell jelentkezni!' };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });

  if (!booking) {
    return { success: false, error: 'A foglalás nem található!' };
  }

  const newStatus = data.status;
  const startStr = data.startDate || booking.startDate.toISOString().split('T')[0];
  const endStr = data.endDate || booking.endDate.toISOString().split('T')[0];
  const guestsNum = data.guests || booking.guests;

  const start = new Date(startStr);
  const end = new Date(endStr);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start >= end) {
    return { success: false, error: 'A távozás dátumának későbbinek kell lennie az érkezésnél!' };
  }

  const nights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const accommodationFee = nights * guestsNum * 7500;
  const ifa = nights * guestsNum * 500;
  const newTotalPrice = `${(accommodationFee + ifa).toLocaleString()} Ft`;

  if (newStatus === 'accepted') {
    // Check overlaps with other accepted bookings
    const tolerance = Number(process.env.BOOKING_TOLERANCE || 0);
    const existingBookings = await prisma.booking.findMany({
      where: {
        roomId: booking.roomId,
        status: 'accepted',
        id: { not: bookingId }
      }
    });

    for (const existing of existingBookings) {
      const eStart = new Date(existing.startDate);
      const eEnd = new Date(existing.endDate);
      eStart.setHours(0, 0, 0, 0);
      eEnd.setHours(0, 0, 0, 0);

      const overlapStart = start.getTime() < (eEnd.getTime() + tolerance * 24 * 60 * 60 * 1000);
      const overlapEnd = end.getTime() > eStart.getTime();

      if (overlapStart && overlapEnd) {
        return {
          success: false,
          error: `Ütközés egy másik elfogadott foglalással! (${existing.name}: ${existing.startDate.toLocaleDateString('hu-HU')} - ${existing.endDate.toLocaleDateString('hu-HU')})`
        };
      }
    }
  }

  try {
    const updateData: any = {
      status: newStatus,
      startDate: start,
      endDate: end,
      guests: guestsNum,
      totalPrice: newTotalPrice,
    };

    if (newStatus === 'accepted') {
      updateData.acceptedAt = new Date();
    } else {
      updateData.acceptedAt = null;
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: updateData
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update booking:', error);
    return { success: false, error: 'Hiba történt a mentés során.' };
  }
}

export async function deleteBooking(bookingId: number) {
  const { isAuthenticated } = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Ehhez a művelethez be kell jelentkezni!' };
  }

  try {
    await prisma.booking.delete({
      where: { id: bookingId }
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete booking:', error);
    return { success: false, error: 'Nem sikerült törölni a foglalást.' };
  }
}
