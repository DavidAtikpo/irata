"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Store, ArrowLeft, User, Mail, MapPin } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    newsletter: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.acceptTerms) {
      setError("Vous devez accepter les conditions pour continuer")
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    setLoading(true)
    try {
      const normalizedEmail = (formData.email || '').trim().toLowerCase()
      const res = await fetch('/api/client/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: normalizedEmail,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          password: formData.password,
        })
      })

      const data = await res.json()
      if (!res.ok) {
        if (res.status === 409) {
          throw new Error('Un utilisateur avec cet email existe déjà')
        }
        throw new Error(data.error || 'Erreur lors de l\'inscription')
      }
      setSuccess('Compte créé avec succès. Redirection...')
      // Optionnel: rediriger vers la connexion
      router.push('/sign-in')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-3">
      <div className="w-full max-w-md">
        {/* Back to store */}
        <div className="mb-4">
          <Link href="/" className="flex items-center text-stone-600 hover:text-stone-900 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à la boutique
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">Créer un compte</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-xs">{success}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-1">
              {/* Personal Information */}
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="firstName" className="text-xs">Prénom *</Label>
                    <Input
                      id="firstName"
                      placeholder="Jean"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="lastName" className="text-xs">Nom *</Label>
                    <Input
                      id="lastName"
                      placeholder="Dupont"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jean.dupont@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs">Téléphone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="address" className="text-xs">Adresse</Label>
                    <Input
                      id="address"
                      placeholder="123 Rue de la Paix"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="city" className="text-xs">Ville</Label>
                      <Input
                        id="city"
                        placeholder="Paris"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="zipCode" className="text-xs">Code postal</Label>
                      <Input
                        id="zipCode"
                        placeholder="75001"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-xs">Mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Votre mot de passe"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                        className="h-8 text-sm pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-8 px-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-3 w-3 text-stone-400" />
                        ) : (
                          <Eye className="h-3 w-3 text-stone-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="confirmPassword" className="text-xs">Confirmer le mot de passe *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirmer le mot de passe"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        required
                        className="h-8 text-sm pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-8 px-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-3 w-3 text-stone-400" />
                        ) : (
                          <Eye className="h-3 w-3 text-stone-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Newsletter */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                    required
                    className="mt-0.5"
                  />
                  <Label htmlFor="acceptTerms" className="text-xs leading-4">
                    J'accepte les{" "}
                    <Link href="/public/cgv" className="text-amber-600 hover:text-amber-700">
                      conditions générales de vente
                    </Link>{" "}
                    et la{" "}
                    <Link href="/public/confidentialite" className="text-amber-600 hover:text-amber-700">
                      politique de confidentialité
                    </Link>{" "}
                    *
                  </Label>
                </div>
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="newsletter"
                    checked={formData.newsletter}
                    onCheckedChange={(checked) => handleInputChange("newsletter", checked as boolean)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="newsletter" className="text-xs">
                    Je souhaite recevoir les actualités et offres spéciales par email
                  </Label>
                </div>
              </div>

              <Button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 h-9" disabled={loading}>
                {loading ? 'Création du compte...' : 'Créer mon compte'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-stone-600">
                Déjà un compte ?{" "}
                <Link href="/sign-in" className="text-amber-600 hover:text-amber-700 font-semibold">
                  Se connecter
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}