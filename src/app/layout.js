import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './Providers'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>CookBuddy AI - Your Personal AI Cooking Assistant</title>
        <meta name="description" content="Discover recipes, plan meals, and get cooking tips tailored to your preferences and dietary needs." />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}