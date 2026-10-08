import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gadanyivendeghaz.hu';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Gadányi Vendégház és Lovarda | Pihenés és lovaglás Komlón, a Mecsekben",
    template: "%s | Gadányi Vendégház és Lovarda",
  },
  description: "Pihenés, lovaglás és természetközeli élmények Komlón, a Mecsek festői lankáin. 8 hektáros birtok, tóparti és erdei környezet, kényelmes szobák. NTAK: MA19005093.",
  keywords: [
    "Gadányi Vendégház",
    "Gadányi Lovarda",
    "szállás Komló",
    "vendégház Komló",
    "lovarda Komló",
    "Mecsek szállás",
    "lovaglás Baranya",
    "családi pihenés Mecsek",
    "erdei szállás",
    "apartman Komló",
    "lovas élmények Baranya",
  ],
  authors: [{ name: "Gadányi Vendégház és Lovarda" }],
  creator: "Gadányi Vendégház és Lovarda",
  publisher: "Gadányi Vendégház és Lovarda",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Gadányi Vendégház és Lovarda | Pihenés és lovaglás Komlón",
    description: "Ébredjen madárcsicsergésre 8 hektáros birtokunkon a Mecsekben, közvetlenül az erdő és halastavak ölelésében.",
    url: siteUrl,
    siteName: "Gadányi Vendégház és Lovarda",
    images: [
      {
        url: "/images/hero-bg.webp",
        width: 1200,
        height: 630,
        alt: "Gadányi Vendégház és Lovarda Komló",
      },
    ],
    locale: "hu_HU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gadányi Vendégház és Lovarda | Komló, Mecsek",
    description: "Pihenés, lovaglás és természetközeli élmények Komlón, a Mecsekben.",
    images: ["/images/hero-bg.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["LodgingBusiness", "BedAndBreakfast"],
      "@id": `${siteUrl}/#lodging`,
      "name": "Gadányi Vendégház és Lovarda",
      "description": "Pihenés, lovaglás és természetközeli élmények Komlón, 8 hektáros birtokon közvetlenül az erdő és a halastavak ölelésében.",
      "url": siteUrl,
      "telephone": ["+36703308959", "+36706290102"],
      "email": "info@gadanyivendeghaz.hu",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Batthyány utca 24.",
        "addressLocality": "Komló",
        "postalCode": "7300",
        "addressCountry": "HU"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 46.1928,
        "longitude": 18.2649
      },
      "image": `${siteUrl}/images/hero-bg.webp`,
      "priceRange": "$$",
      "sameAs": [
        "https://www.facebook.com/gadanyivendeghazeslovarda/?locale=hu_HU"
      ],
      "amenityFeature": [
        {
          "@type": "LocationFeatureSpecification",
          "name": "Lovaglás / Tereplovaglás",
          "value": true
        },
        {
          "@type": "LocationFeatureSpecification",
          "name": "Ingyenes parkolás",
          "value": true
        },
        {
          "@type": "LocationFeatureSpecification",
          "name": "Wi-Fi",
          "value": true
        },
        {
          "@type": "LocationFeatureSpecification",
          "name": "Halastó és erdei környezet",
          "value": true
        }
      ]
    },
    {
      "@type": "SportsActivityLocation",
      "@id": `${siteUrl}/#lovarda`,
      "name": "Gadányi Lovarda",
      "description": "Lovas oktatás, túralovaglás és lovas programok a Mecsekben.",
      "url": siteUrl,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Batthyány utca 24.",
        "addressLocality": "Komló",
        "postalCode": "7300",
        "addressCountry": "HU"
      },
      "telephone": "+36703308959"
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
