import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const host = request.headers.get('host') || '';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';

    // Belső lekérések és localhost elkerülése, hogy az Image Optimizer megfelelően működjön
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('[::1]');

    if (process.env.NODE_ENV === 'production' && !isLocalhost) {
        const url = request.nextUrl.clone();

        if (!host.startsWith('www.') || protocol !== 'https') {
            const cleanHost = host.replace(/^www\./, '');

            return NextResponse.redirect(
                `https://www.${cleanHost}${url.pathname}${url.search}`,
                308
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*$).*)',
    ],
};
