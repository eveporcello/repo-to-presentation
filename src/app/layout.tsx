import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Repo to Presentation',
  description: 'Transform your GitHub repositories into compelling presentation materials with AI',
  keywords: ['github', 'presentation', 'developer tools', 'AI', 'Claude'],
  authors: [{ name: 'Eve Porcello', url: 'https://moonhighway.com' }],
  creator: 'Eve Porcello',
  openGraph: {
    title: 'Repo to Presentation',
    description: 'Transform your GitHub repositories into compelling presentation materials',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Repo to Runway',
    description: 'Transform your GitHub repositories into compelling presentation materials',
    creator: '@eveporcello',
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL('https://repo-to-runway.vercel.app'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="h-full bg-gray-50 antialiased font-sans">
        <div className="min-h-full">
          {children}
        </div>
      </body>
    </html>
  )
}