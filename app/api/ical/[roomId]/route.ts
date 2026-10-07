import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ roomId: string }> }
) {
  const params = await props.params;
  const roomId = parseInt(params.roomId, 10);
  if (isNaN(roomId)) {
    return new NextResponse('Invalid Room ID', { status: 400 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        roomId,
        status: { in: ['accepted', 'closed'] },
      },
    });

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Gadanyi Vendeghaz//Calendar Sync//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    bookings.forEach((booking) => {
      const formatDate = (date: Date) => {
        const y = date.getUTCFullYear();
        const m = String(date.getUTCMonth() + 1).padStart(2, '0');
        const d = String(date.getUTCDate()).padStart(2, '0');
        return `${y}${m}${d}`;
      };

      const start = formatDate(new Date(booking.startDate));
      const end = formatDate(new Date(booking.endDate));
      
      const created = new Date(booking.createdAt).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const uid = `booking-${booking.id}@gadanyivendeghaz.hu`;
      const summary = booking.status === 'closed' ? 'Zárva' : `Foglalás - ${booking.name}`;

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${created}`,
        `DTSTART;VALUE=DATE:${start}`,
        `DTEND;VALUE=DATE:${end}`,
        `SUMMARY:${summary}`,
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    return new NextResponse(icsContent.join('\r\n'), {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="room-${roomId}.ics"`,
      },
    });
  } catch (error) {
    console.error('Failed to generate iCal:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
