import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/providers'

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://quoteflow.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'QuoteFlow — AI Lead Intake for Service Businesses',
    template: '%s | QuoteFlow',
  },
  description:
    'Embed a conversational intake widget on any website. AI qualifies leads, generates instant price estimates, and notifies you — automatically.',
  keywords: ['lead generation', 'quote automation', 'AI intake form', 'service business', 'embed widget', 'CRM'],
  authors: [{ name: 'Abdul Sami' }],
  creator: 'Abdul Sami',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    url: APP_URL,
    title: 'QuoteFlow — AI Lead Intake for Service Businesses',
    description:
      'Embed a conversational intake widget on any website. AI qualifies leads, generates instant price estimates, and notifies you — automatically.',
    siteName: 'QuoteFlow',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'QuoteFlow dashboard preview' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuoteFlow — AI Lead Intake for Service Businesses',
    description: 'Embed a conversational intake widget. AI qualifies leads and generates instant quotes automatically.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Apply theme before first paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light')t='light';document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('light');}})();`,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
