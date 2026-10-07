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
        status: { in: ['accepted', 'closed'] },
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
  honeypot: string;
  turnstileToken: string;
}) {
  // 1. Honeypot check
  if (data.honeypot !== '') {
    console.warn('Bot detection: Honeypot field was filled');
    return { success: false, error: 'Biztonsági ellenőrzés sikertelen (Honeypot)!' };
  }

  // 2. Turnstile token check
  if (!data.turnstileToken) {
    return { success: false, error: 'Kérjük, igazolja, hogy Ön nem robot!' };
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${encodeURIComponent(process.env.TURNSTILE_SECRET_KEY || '')}&response=${encodeURIComponent(data.turnstileToken)}`,
    });

    const verification = await response.json();
    if (!verification.success) {
      console.warn('Bot detection: Turnstile verification failed', verification);
      return { success: false, error: 'Biztonsági ellenőrzés sikertelen (Turnstile)!' };
    }
  } catch (err) {
    console.error('Turnstile verification error:', err);
    return { success: false, error: 'Nem sikerült ellenőrizni a biztonsági tokent. Kérjük, próbálja újra!' };
  }

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
      source: b.source,
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
    name?: string;
    email?: string;
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

  const start = new Date(startStr);
  const end = new Date(endStr);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start >= end) {
    return { success: false, error: 'A távozás dátumának későbbinek kell lennie az érkezésnél!' };
  }

  let guestsNum = 0;
  let nameStr = 'Szoba Zárás';
  let emailStr = '-';
  let newTotalPrice = '0 Ft';

  if (newStatus !== 'closed') {
    nameStr = data.name !== undefined ? data.name : (booking.name === 'Szoba Zárás' ? 'Manuális foglalás' : booking.name);
    emailStr = data.email !== undefined ? data.email : (booking.email === '-' ? '-' : booking.email);
    guestsNum = data.guests !== undefined ? data.guests : (booking.guests === 0 ? 2 : booking.guests);

    const nights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const accommodationFee = nights * guestsNum * 7500;
    const ifa = nights * guestsNum * 500;
    newTotalPrice = `${(accommodationFee + ifa).toLocaleString()} Ft`;
  }

  if (newStatus === 'accepted' || newStatus === 'closed') {
    // Check overlaps with other accepted bookings or room closures
    const tolerance = Number(process.env.BOOKING_TOLERANCE || 0);
    const existingBookings = await prisma.booking.findMany({
      where: {
        roomId: booking.roomId,
        status: { in: ['accepted', 'closed'] },
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
          error: `Ütközés egy másik elfogadott foglalással vagy lezárással! (${existing.name}: ${existing.startDate.toLocaleDateString('hu-HU')} - ${existing.endDate.toLocaleDateString('hu-HU')})`
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
      name: nameStr,
      email: emailStr,
      totalPrice: newTotalPrice,
    };

    if (newStatus === 'accepted' || newStatus === 'closed') {
      updateData.acceptedAt = booking.acceptedAt || new Date();
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

export async function getDashboardData() {
  const { isAuthenticated } = await checkAuth();
  if (!isAuthenticated) {
    throw new Error('Not authenticated');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    // 1. Active bookings count (accepted, starting today or later)
    const activeCount = await prisma.booking.count({
      where: {
        status: 'accepted',
        startDate: {
          gte: today,
        },
      },
    });

    // 2. Pending bookings count (pending, starting today or later)
    const pendingCount = await prisma.booking.count({
      where: {
        status: 'pending',
        startDate: {
          gte: today,
        },
      },
    });

    // 3. Recent activities: fetch last 20 bookings modified
    const recentBookings = await prisma.booking.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
      take: 20,
    });

    const allActivities: any[] = [];

    recentBookings.forEach(b => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      const formattedCheckIn = start.toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const formattedCheckOut = end.toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' });
      const nights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      
      const room = Rooms.find(r => r.id === b.roomId);
      const roomName = room ? room.name : `${b.roomId}. szoba`;
      const description = `${b.name} - ${roomName}, ${b.guests} fő, ${nights} éj (${formattedCheckIn} - ${formattedCheckOut})`;

      if (b.status === 'closed') {
        allActivities.push({
          id: `${b.id}-closed`,
          title: 'Szoba lezárva',
          description: `${roomName} lezárva: ${formattedCheckIn} - ${formattedCheckOut}`,
          timestamp: new Date(b.createdAt),
          status: 'closed',
        });
      } else {
        // 1. Create activity (always exists)
        allActivities.push({
          id: `${b.id}-create`,
          title: 'Új ajánlatkérés érkezett',
          description,
          timestamp: new Date(b.createdAt),
          status: 'new',
        });

        // 2. Action activity (if accepted or rejected)
        if (b.status === 'accepted') {
          allActivities.push({
            id: `${b.id}-accept`,
            title: 'Foglalás visszaigazolva',
            description,
            timestamp: new Date(b.acceptedAt || b.updatedAt),
            status: 'completed',
          });
        } else if (b.status === 'rejected') {
          allActivities.push({
            id: `${b.id}-reject`,
            title: 'Ajánlatkérés elutasítva',
            description,
            timestamp: new Date(b.updatedAt),
            status: 'rejected',
          });
        }
      }
    });

    // Sort combined activities by timestamp descending
    allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Format top 5 relative time
    const recentActivities = allActivities.slice(0, 5).map(act => {
      let time = '';
      const timeDiff = new Date().getTime() - act.timestamp.getTime();
      const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
      const minsDiff = Math.floor(timeDiff / (1000 * 60));
      if (minsDiff < 60) {
        time = minsDiff <= 0 ? 'most' : `${minsDiff} perce`;
      } else if (hoursDiff < 24) {
        time = `${hoursDiff} órája`;
      } else {
        const daysDiff = Math.floor(hoursDiff / 24);
        time = `${daysDiff} napja`;
      }

      return {
        id: act.id,
        title: act.title,
        description: act.description,
        time,
        status: act.status,
      };
    });

    return {
      activeCount,
      pendingCount,
      recentActivities,
    };
  } catch (error) {
    console.error('Failed to get dashboard data:', error);
    return {
      activeCount: 0,
      pendingCount: 0,
      recentActivities: [],
    };
  }
}

export async function createAdminBooking(data: {
  roomId: number;
  startDate: string;
  endDate: string;
  status: 'closed' | 'accepted';
  name?: string;
  email?: string;
  guests?: number;
}) {
  const { isAuthenticated } = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Ehhez a művelethez be kell jelentkezni!' };
  }

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start >= end) {
    return { success: false, error: 'A távozás dátumának későbbinek kell lennie az érkezésnél!' };
  }

  // Check overlaps
  const tolerance = Number(process.env.BOOKING_TOLERANCE || 0);
  const existingBookings = await prisma.booking.findMany({
    where: {
      roomId: data.roomId,
      status: { in: ['accepted', 'closed'] },
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
        error: `Ütközés egy meglévő foglalással vagy lezárással! (${existing.name}: ${existing.startDate.toLocaleDateString('hu-HU')} - ${existing.endDate.toLocaleDateString('hu-HU')})`
      };
    }
  }

  try {
    let name = 'Szoba Zárás';
    let email = '-';
    let guests = 0;
    let totalPrice = '0 Ft';

    if (data.status === 'accepted') {
      name = data.name || 'Manuális foglalás';
      email = data.email || '-';
      guests = data.guests || 1;

      const nights = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const accommodationFee = nights * guests * 7500;
      const ifa = nights * guests * 500;
      totalPrice = `${(accommodationFee + ifa).toLocaleString()} Ft`;
    }

    await prisma.booking.create({
      data: {
        roomId: data.roomId,
        startDate: start,
        endDate: end,
        name,
        email,
        guests,
        totalPrice,
        status: data.status,
        acceptedAt: new Date(),
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to create admin booking:', error);
    return { success: false, error: 'Hiba történt a szoba rögzítése során.' };
  }
}

// Private helper to parse iCalendar (.ics) files into structured JS objects
function parseICS(icsText: string) {
  const events: Array<{
    uid: string;
    startDate: Date;
    endDate: Date;
    summary: string;
  }> = [];

  const parts = icsText.split('BEGIN:VEVENT');
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].split('END:VEVENT')[0];
    
    const uidMatch = part.match(/UID:(.+)/i);
    const summaryMatch = part.match(/SUMMARY:(.+)/i);
    const dtstartMatch = part.match(/DTSTART(?:;[^:]*)?:(\d{8}T?\d{0,6}Z?)/i);
    const dtendMatch = part.match(/DTEND(?:;[^:]*)?:(\d{8}T?\d{0,6}Z?)/i);

    if (dtstartMatch && dtendMatch) {
      const uid = uidMatch ? uidMatch[1].trim() : `imported-${Date.now()}-${i}`;
      const summary = summaryMatch ? summaryMatch[1].trim() : 'Külső Foglalás';
      
      const parseDateStr = (dateStr: string) => {
        const year = parseInt(dateStr.slice(0, 4), 10);
        const month = parseInt(dateStr.slice(4, 6), 10) - 1;
        const day = parseInt(dateStr.slice(6, 8), 10);
        
        let hours = 0;
        let minutes = 0;
        let seconds = 0;
        
        if (dateStr.includes('T')) {
          const tIdx = dateStr.indexOf('T');
          hours = parseInt(dateStr.slice(tIdx + 1, tIdx + 3), 10) || 0;
          minutes = parseInt(dateStr.slice(tIdx + 3, tIdx + 5), 10) || 0;
          seconds = parseInt(dateStr.slice(tIdx + 5, tIdx + 7), 10) || 0;
        }
        
        return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
      };

      const startDate = parseDateStr(dtstartMatch[1]);
      const endDate = parseDateStr(dtendMatch[1]);

      events.push({
        uid,
        startDate,
        endDate,
        summary,
      });
    }
  }

  return events;
}

// Server action to sync external booking calendars from booking.com and szallas.hu
export async function syncExternalCalendars() {
  const { isAuthenticated } = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Ehhez a művelethez be kell jelentkezni!' };
  }

  let totalImported = 0;
  let totalDeleted = 0;
  const errors: string[] = [];

  try {
    const configs = await prisma.calendarSyncConfig.findMany();

    if (configs.length === 0) {
      return { success: false, error: 'Nincsenek beállítva naptár szinkronizációs linkek az adatbázisban!' };
    }

    for (const config of configs) {
      const room = Rooms.find(r => r.id === config.roomId);
      const roomName = room ? room.name : `${config.roomId}. szoba`;

      if (!config.url || !config.url.trim()) {
        continue;
      }

      try {
        const response = await fetch(config.url.trim(), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Calendar Sync'
          },
          next: { revalidate: 0 } // Bypass cache
        });

        if (!response.ok) {
          throw new Error(`HTTP hiba: ${response.status}`);
        }

        const icsText = await response.text();
        const events = parseICS(icsText);
        const uidsInFeed = events.map(e => e.uid);

        // 1. Delete local bookings from this source for this room that are no longer in the feed
        const deletedResult = await prisma.booking.deleteMany({
          where: {
            roomId: config.roomId,
            source: config.source,
            email: { notIn: uidsInFeed }
          }
        });
        totalDeleted += deletedResult.count;

        // 2. Upsert bookings
        for (const event of events) {
          const existing = await prisma.booking.findFirst({
            where: {
              roomId: config.roomId,
              source: config.source,
              email: event.uid
            }
          });

          if (existing) {
            // Update if changed
            const eventStart = new Date(event.startDate);
            const eventEnd = new Date(event.endDate);
            
            if (existing.startDate.getTime() !== eventStart.getTime() || 
                existing.endDate.getTime() !== eventEnd.getTime() || 
                existing.name !== event.summary) {
              await prisma.booking.update({
                where: { id: existing.id },
                data: {
                  startDate: eventStart,
                  endDate: eventEnd,
                  name: event.summary,
                }
              });
            }
          } else {
            // Create new
            await prisma.booking.create({
              data: {
                roomId: config.roomId,
                source: config.source,
                startDate: event.startDate,
                endDate: event.endDate,
                name: event.summary,
                email: event.uid,
                guests: 2,
                totalPrice: '0 Ft',
                status: 'accepted'
              }
            });
            totalImported++;
          }
        }
      } catch (err: any) {
        console.error(`Sync error for room ${config.roomId} (${config.source}):`, err);
        errors.push(`${roomName} (${config.source}): ${err.message || err}`);
      }
    }
  } catch (dbErr: any) {
    console.error('Failed to load calendar sync configs:', dbErr);
    return { success: false, error: 'Nem sikerült betölteni a szinkronizációs beállításokat.' };
  }

  if (errors.length > 0) {
    return { 
      success: false, 
      error: `Hiba történt néhány csatorna szinkronizálásakor:\n${errors.join('\n')}` 
    };
  }

  return { success: true, imported: totalImported, deleted: totalDeleted };
}

export async function getCalendarConfigs() {
  const { isAuthenticated, role } = await checkAuth();
  if (!isAuthenticated) {
    throw new Error('Not authenticated');
  }
  if (role !== 'super') {
    throw new Error('Only superadmin can access settings');
  }

  try {
    return await prisma.calendarSyncConfig.findMany({
      orderBy: [
        { roomId: 'asc' },
        { source: 'asc' }
      ]
    });
  } catch (error) {
    console.error('Failed to get calendar configs:', error);
    return [];
  }
}

export async function saveCalendarConfig(data: {
  roomId: number;
  source: string;
  url: string;
}) {
  const { isAuthenticated, role } = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Ehhez a művelethez be kell jelentkezni!' };
  }
  if (role !== 'super') {
    return { success: false, error: 'Csak szuperadmin módosíthatja ezeket a beállításokat!' };
  }

  if (!data.url.trim()) {
    return { success: false, error: 'A link nem lehet üres!' };
  }

  try {
    await prisma.calendarSyncConfig.upsert({
      where: {
        roomId_source: {
          roomId: data.roomId,
          source: data.source
        }
      },
      update: {
        url: data.url.trim()
      },
      create: {
        roomId: data.roomId,
        source: data.source,
        url: data.url.trim()
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to save calendar config:', error);
    return { success: false, error: `Nem sikerült menteni a beállítást: ${error.message || error}` };
  }
}

export async function deleteCalendarConfig(id: number) {
  const { isAuthenticated, role } = await checkAuth();
  if (!isAuthenticated) {
    return { success: false, error: 'Ehhez a művelethez be kell jelentkezni!' };
  }
  if (role !== 'super') {
    return { success: false, error: 'Csak szuperadmin törölheti ezeket a beállításokat!' };
  }

  try {
    await prisma.calendarSyncConfig.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to delete calendar config:', error);
    return { success: false, error: 'Nem sikerült törölni a beállítást.' };
  }
}
