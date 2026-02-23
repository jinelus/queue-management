import { GeistPixelSquare } from 'geist/font/pixel'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'QSpot',
  description: 'Virtual queue management for calmer waits and faster service.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className={`${GeistSans.variable} ${GeistPixelSquare.variable}`}>
      <body className='antialiased'>{children}</body>
    </html>
  )
}
