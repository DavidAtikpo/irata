import type React from "react"
import { Inter, Playfair_Display } from "next/font/google"
import "../globals.css"
import { ClientSidebar } from "../../components/client/client-sidebar"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata = {
  title: "Espace Client - IRATA Store",
  description: "Gérez vos commandes et investissements sur IRATA Store",
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-stone-50">
        <div className="flex h-screen">
          <ClientSidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
