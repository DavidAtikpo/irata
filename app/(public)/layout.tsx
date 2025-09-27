import type React from "react"
import { Inter, Playfair_Display } from "next/font/google"
import { WhatsAppChat } from "../components/whatsapp-chat"
import "../globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata = {
  title: "a-finpart Store - Matériaux Cordiste Professionnels",
  description:
    "Boutique en ligne spécialisée dans la vente de matériaux pour cordistes et financement participatif de projets.",
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.variable} ${playfair.variable} font-sans antialiased min-h-screen`}>
      <WhatsAppChat />
      {children}
    </div>
  )
}
