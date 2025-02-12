import "./globals.css"
import { Lora } from "next/font/google"
import { Providers } from "./providers"
import type React from "react"
import type { Metadata } from 'next'

const lora = Lora({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'Thankly',
  description: 'Your daily gratitude journal',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" 
        />
      </head>
      <body className={lora.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

