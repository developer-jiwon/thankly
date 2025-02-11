import "./globals.css"
import { Lora } from "next/font/google"
import { Providers } from "./providers"
import type React from "react"
import { metadata } from "./metadata"

const lora = Lora({ subsets: ["latin"] })

export { metadata }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={lora.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

