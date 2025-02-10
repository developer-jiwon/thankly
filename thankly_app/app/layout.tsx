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
      <body className={lora.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

