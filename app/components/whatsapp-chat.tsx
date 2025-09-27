"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, X, Send } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface WhatsAppChatProps {
  phoneNumber?: string
  defaultMessage?: string
  productName?: string
  productUrl?: string
}

export function WhatsAppChat({
  phoneNumber = "+22892591228", // Remplacez par votre numéro WhatsApp
  defaultMessage = "Bonjour, j'aimerais avoir plus d'informations.",
  productName,
  productUrl,
}: WhatsAppChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState(defaultMessage)

  const handleSendMessage = () => {
    let finalMessage = `Bonjour,\n\nNom: ${name}\nEmail: ${email}\n\nMessage: ${message}`

    if (productName) {
      finalMessage += `\n\nProduit d'intérêt: ${productName}`
    }

    if (productUrl) {
      finalMessage += `\nLien: ${productUrl}`
    }

    const encodedMessage = encodeURIComponent(finalMessage)
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodedMessage}`

    window.open(whatsappUrl, "_blank")
    setIsOpen(false)

    // Reset form
    setName("")
    setEmail("")
    setMessage(defaultMessage)
  }

  const handleQuickMessage = (quickMsg: string) => {
    const encodedMessage = encodeURIComponent(quickMsg)
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodedMessage}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse"
          size="icon"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </Button>
      </div>

      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-72 max-w-[calc(100vw-3rem)]">
          <Card className="shadow-2xl border-green-200">
            <CardHeader className="bg-green-500 text-white rounded-t-lg p-3">
              <CardTitle className="flex items-center space-x-2 text-sm">
                <MessageCircle className="h-4 w-4" />
                <span>Chat WhatsApp</span>
              </CardTitle>
              <p className="text-green-100 text-xs">Nous sommes là pour vous aider !</p>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              {/* Quick Actions */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Actions rapides:</p>
                <div className="flex flex-col space-y-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickMessage("Bonjour, j'aimerais avoir des informations sur vos produits.")}
                    className="justify-start text-left h-8 py-1 text-xs"
                  >
                     Informations produits
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickMessage("Bonjour, j'ai besoin d'aide pour ma commande.")}
                    className="justify-start text-left h-8 py-1 text-xs"
                  >
                     Aide commande
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickMessage("Bonjour, j'aimerais connaître vos conditions de livraison.")}
                    className="justify-start text-left h-8 py-1 text-xs"
                  >
                     Livraison
                  </Button>
                </div>
              </div>

              <div className="border-t pt-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">Ou envoyez un message personnalisé:</p>

                <div className="space-y-2">
                  <div>
                    <Label htmlFor="name" className="text-xs">
                      Nom
                    </Label>
                    <Input
                      id="name"
                      placeholder="Votre nom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-xs">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Votre message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[60px] resize-none text-xs"
                    />
                  </div>

                  <Button
                    onClick={handleSendMessage}
                    className="w-full bg-green-500 hover:bg-green-600 h-8 text-xs"
                    disabled={!name.trim() || !message.trim()}
                  >
                    <Send className="mr-1 h-3 w-3" />
                    Envoyer sur WhatsApp
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-center pt-1 border-t">
                Vous serez redirigé vers WhatsApp
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
