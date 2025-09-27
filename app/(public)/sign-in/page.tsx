"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Store, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/client/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: (email || '').trim().toLowerCase(), password }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(data.error || 'Email ou mot de passe incorrect')
        }
        if (response.status === 403) {
          throw new Error(data.error || "Accès réservé aux clients")
        }
        throw new Error(data.error || 'Erreur de connexion')
      }

      // Redirection selon le rôle
      const role = (data?.user?.role as string) || 'CLIENT'
      let destination = '/client/dashboard'
      if (role === 'ADMIN') {
        destination = '/vendor'
      } 
      router.push(destination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-3">
      <div className="w-full max-w-sm">
        <div className="mb-4">
          <Link href="/" className="flex items-center text-stone-600 hover:text-stone-900 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à la boutique
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-2">
              <Store className="h-6 w-6 text-amber-600 mr-2" />
              <span className="text-xl font-bold text-stone-900 font-playfair">a-finpart Store</span>
            </div>
            <CardTitle className="text-xl">Connexion</CardTitle>
            <CardDescription className="text-sm">
              Connectez-vous à votre espace client
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-xs">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="h-3 w-3"
                  />
                  <Label htmlFor="remember" className="text-xs">
                    Se souvenir de moi
                  </Label>
                </div>
                <Link href="/client/forgot-password" className="text-xs text-amber-600 hover:text-amber-700">
                  Mot de passe oublié ?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-stone-900 hover:bg-stone-800 h-9 mt-4"
                disabled={loading}
              >
                {loading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-stone-600">
                Pas encore de compte ?{" "}
                <Link href="/public/register" className="text-amber-600 hover:text-amber-700 font-semibold">
                  Créer un compte
                </Link>
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-200">
              <div className="text-center">
                <p className="text-xs text-stone-500 mb-2">Ou continuer avec</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full bg-transparent h-8 text-xs">
                    <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent h-8 text-xs">
                    <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}