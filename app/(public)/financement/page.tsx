"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Heart, Users, Calendar, Target, TrendingUp, Award, Menu, X } from "lucide-react"
import Link from "next/link"

const EXCHANGE_RATES = {
  FCFA: 1,
  XOF: 1,
  EUR: 0.00152,
  USD: 0.00167,
  GHS: 0.023,
  NGN: 0.67,
  GBP: 0.0013,
  CHF: 0.0014,
} as const

const CURRENCIES = [
  { code: "FCFA", name: "Franc CFA", symbol: "FCFA", region: "Afrique de l'Ouest" },
  { code: "XOF", name: "Franc CFA", symbol: "FCFA", region: "Afrique de l'Ouest" },
  { code: "GHS", name: "Cedis", symbol: "₵", region: "Ghana" },
  { code: "NGN", name: "Naira", symbol: "₦", region: "Nigeria" },
  { code: "EUR", name: "Euro", symbol: "€", region: "Europe" },
  { code: "GBP", name: "Livre Sterling", symbol: "£", region: "Royaume-Uni" },
  { code: "CHF", name: "Franc Suisse", symbol: "CHF", region: "Suisse" },
  { code: "USD", name: "Dollar US", symbol: "$", region: "Amérique du Nord" },
] as const

function getCurrencyByCode(code: keyof typeof EXCHANGE_RATES) {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[4] // default EUR
}

export default function CrowdfundingPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [currency, setCurrency] = useState<keyof typeof EXCHANGE_RATES>("EUR")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const convertFromFcfa = (amountFcfa: number, target: keyof typeof EXCHANGE_RATES) => {
    const rate = EXCHANGE_RATES[target] || 1
    return amountFcfa * rate
  }

  const formatAmount = (amountFcfa: number) => {
    const cur = getCurrencyByCode(currency)
    const value = convertFromFcfa(amountFcfa, currency)
    const formatted = value.toLocaleString("fr-FR")
    return `${formatted} ${cur.symbol}`
  }

  const projects = [
    {
      id: 1,
      title: "Centre Multi-Formations Sécurité — Togo",
      shortDescription:
        "Matériel cordiste • Appareil à ultrasons CND • Équipement SST",
      description:
        "Ce projet innovant vise à créer l'un des premiers centres de multi formations en sécurité au Togo. Avec un bâtiment avancé à 95%, nous sommes prêts à équiper les salles de cours, la structure d'entraînement et les futurs logements. Cette initiative créera de nombreuses opportunités d'emploi pour les jeunes togolais et développera les compétences locales dans les domaines de la sécurité industrielle.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPXckWWcGeH9F9J9aPxAlMKjd-gFH5JA8eXQ&s",
      targetAmount: 15000000,
      currentAmount: 800000,
      backers: 2,
      daysLeft: 70,
      category: "formation",
      status: "active",
      rewards: [],
    },
  ]

  const categories = [
    { value: "all", label: "Tous les projets", count: projects.length },
    
  ]

  const filteredProjects = projects.filter(
    (project) => selectedCategory === "all" || project.category === selectedCategory,
  )

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
              a-finpart Store
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-6">
              <Link href="/" className="text-stone-600 hover:text-stone-900 transition-colors">Accueil</Link>
              <Link href="/produits" className="text-stone-600 hover:text-stone-900 transition-colors">Produits</Link>
              <a href="/categories" className="text-stone-600 hover:text-stone-900 transition-colors">Catégories</a>
              <a href="/financement" className="text-amber-600 font-semibold">Financement</a>
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button size="sm" className="bg-stone-900 hover:bg-stone-800 text-xs sm:text-sm">
                Connexion
              </Button>
              
              {/* Mobile menu button */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-stone-200 py-4">
              <nav className="flex flex-col space-y-3">
                <Link href="/" className="text-stone-600 hover:text-stone-900 transition-colors py-2">Accueil</Link>
                <Link href="/produits" className="text-stone-600 hover:text-stone-900 transition-colors py-2">Produits</Link>
                <a href="/categories" className="text-stone-600 hover:text-stone-900 transition-colors py-2">Catégories</a>
                <a href="/financement" className="text-amber-600 font-semibold py-2">Financement</a>
              </nav>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 font-serif mb-3 sm:mb-4 px-2">
            Financement Participatif
          </h1>
          <p className="text-stone-600 max-w-3xl mx-auto text-base sm:text-lg px-4">
            Matériel cordiste IRATA • Appareil à ultrasons CND • Équipement SST
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          <Card className="text-center">
            <CardContent className="p-3 sm:p-6">
              <div className="bg-amber-100 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Target className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-stone-900 leading-tight">{formatAmount(15000000)}</div>
              <div className="text-stone-600 text-xs sm:text-sm mt-1">Objectif global</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3 sm:p-6">
              <div className="bg-amber-100 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-stone-900">—</div>
              <div className="text-stone-600 text-xs sm:text-sm mt-1">Contributeurs</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3 sm:p-6">
              <div className="bg-amber-100 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-stone-900">1</div>
              <div className="text-stone-600 text-xs sm:text-sm mt-1">Projet en cours</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3 sm:p-6">
              <div className="bg-amber-100 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Award className="h-4 w-4 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-stone-900">98%</div>
              <div className="text-stone-600 text-xs sm:text-sm mt-1">Taux de réussite</div>
            </CardContent>
          </Card>
        </div>

        {/* Project Narrative */}
        <div className="mb-8 sm:mb-12 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl mb-3">À propos du projet</CardTitle>
              <CardDescription className="text-sm sm:text-base leading-relaxed">
                Ce projet innovant vise à créer l'un des premiers centres de multi formations en sécurité au Togo. Avec
                un bâtiment avancé à 95%, nous sommes prêts à équiper les salles de cours, la structure d'entraînement
                et les futurs logements. Cette initiative créera de nombreuses opportunités d'emploi pour les jeunes
                togolais et développera les compétences locales dans les domaines de la sécurité industrielle.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl mb-3">Objectifs du projet</CardTitle>
              <ul className="list-disc pl-5 space-y-2 text-stone-700 text-sm sm:text-base">
                <li>Acquisition matériel Cordiste certifié avec certificats de conformité et de contrôle</li>
                <li>Acquisition de 6 appareils complémentaires à ultrasons pour contrôles non destructifs (CND)</li>
                <li>Équipement complet en matériel de Santé et Sécurité au Travail (SST)</li>
                <li>Formation d'une équipe locale de formateurs pour devenir les référents des futures formations</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Financing Plan */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4 px-2">Plan de financement</h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg mb-2">Matériel Cordiste </CardTitle>
                <CardDescription className="mb-2 text-sm">Budget nécessaire</CardDescription>
                <div className="text-xl sm:text-2xl font-bold">{formatAmount(8000000)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg mb-2">Appareils Ultrasons CND</CardTitle>
                <CardDescription className="mb-2 text-sm">Budget nécessaire</CardDescription>
                <div className="text-xl sm:text-2xl font-bold">{formatAmount(4000000)}</div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 xl:col-span-1">
              <CardContent className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg mb-2">Équipement SST</CardTitle>
                <CardDescription className="mb-2 text-sm">Budget nécessaire</CardDescription>
                <div className="text-xl sm:text-2xl font-bold">{formatAmount(3000000)}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8 px-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.value)}
              className="flex items-center gap-2 text-xs sm:text-sm"
              size="sm"
            >
              {category.label}
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Project Card */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8 sm:mb-12">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 sm:h-64">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-amber-500 text-stone-900 text-xs">
                  Formation
                </Badge>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/80 hover:bg-white p-2"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl mb-2 leading-tight">{project.title}</CardTitle>
                <CardDescription className="mb-4 text-sm sm:text-base">{project.shortDescription}</CardDescription>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span className="text-stone-600">Objectif</span>
                      <span className="font-semibold text-right">
                        {formatAmount(project.currentAmount)} / {formatAmount(project.targetAmount)}
                      </span>
                    </div>
                    <Progress
                      value={getProgressPercentage(project.currentAmount, project.targetAmount)}
                      className="h-2 sm:h-3"
                    />
                    <div className="text-right text-xs sm:text-sm text-amber-600 font-semibold mt-1">
                      {Math.round(getProgressPercentage(project.currentAmount, project.targetAmount))}%
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs sm:text-sm">
                    <div className="flex items-center gap-1 text-stone-600">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                      {project.backers} contributeurs
                    </div>
                    <div className="flex items-center gap-1 text-stone-600">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      {project.daysLeft} jours restants
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-stone-900 text-sm">
                      Contribuer
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent text-sm">
                      En savoir plus
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Investment Options */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 px-2">Formules de participation</h2>
            <div className="flex items-center gap-2 px-2">
              <span className="text-sm text-stone-600 whitespace-nowrap">Devise</span>
              <Select value={currency} onValueChange={(v) => setCurrency(v as keyof typeof EXCHANGE_RATES)}>
                <SelectTrigger className="w-[140px] sm:w-[160px] text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code} className="text-xs sm:text-sm">
                      {`${c.code} — ${c.symbol}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg mb-2"> Pré-financement Formation</CardTitle>
                <CardDescription className="mb-3 text-sm">
                  Investissez dans votre future formation avec une remise de 10%
                </CardDescription>
                <div className="text-xs sm:text-sm text-stone-600 mb-4">
                  Min {formatAmount(50000)} • Max {formatAmount(500000)}
                </div>
                <Badge variant="secondary" className="text-xs">Remise 10%</Badge>
                <div className="mt-4">
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 text-sm">
                    Participer
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg mb-2">💸 Don Financier à Rendement</CardTitle>
                <CardDescription className="mb-3 text-sm">
                  Recevez 8% de rendement en maximum 4 mois
                </CardDescription>
                <div className="text-xs sm:text-sm text-stone-600 mb-4">
                  Min {formatAmount(50000)} • Max {formatAmount(1000000)}
                </div>
                <Badge variant="secondary" className="text-xs">Rendement 8%</Badge>
                <div className="mt-4">
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 text-sm">
                    Participer
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 xl:col-span-1">
              <CardContent className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg mb-2">Récompenses Matérielles</CardTitle>
                <CardDescription className="mb-3 text-sm">
                  Recevez des objets de marque exclusifs du centre
                </CardDescription>
                <div className="text-xs sm:text-sm text-stone-600 mb-4">
                  Min {formatAmount(25000)} • Max {formatAmount(200000)}
                </div>
                <Badge variant="secondary" className="text-xs">Goodies</Badge>
                <div className="mt-4">
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 text-sm">
                    Participer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4 px-2">Échéancier</h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Phase 1 — Financement</CardTitle>
                <CardDescription className="text-sm">Septembre 2025</CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Phase 2 — Équipement</CardTitle>
                <CardDescription className="text-sm">Fin Octobre 2025</CardDescription>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 xl:col-span-1">
              <CardContent className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Phase 3 — Ouverture</CardTitle>
                <CardDescription className="text-sm">Début Décembre 2025</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Matériels à acquérir */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-4 px-2">Matériels à acquérir</h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded mb-3 h-32 sm:h-40 flex items-center justify-center">
                  <span className="text-amber-800 text-xs sm:text-sm font-medium">Harnais</span>
                </div>
                <CardTitle className="text-base sm:text-lg mb-1">Harnais Professionnel</CardTitle>
                <CardDescription className="mb-2 text-xs sm:text-sm">
                  Certifié • Haute résistance
                </CardDescription>
                <div className="text-xs sm:text-sm text-stone-600">
                  Budget unitaire ~ {formatAmount(180000)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="bg-gradient-to-br from-stone-100 to-stone-200 rounded mb-3 h-32 sm:h-40 flex items-center justify-center">
                  <span className="text-stone-800 text-xs sm:text-sm font-medium">Corde statique</span>
                </div>
                <CardTitle className="text-base sm:text-lg mb-1">Cordes Statiques 11mm (x50m)</CardTitle>
                <CardDescription className="mb-2 text-xs sm:text-sm">
                  Norme EN1891 • Faible allongement
                </CardDescription>
                <div className="text-xs sm:text-sm text-stone-600">
                  Budget unitaire ~ {formatAmount(120000)}
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-2 xl:col-span-1">
              <CardContent className="p-4 sm:p-6">
                <div className="bg-gradient-to-br from-red-100 to-red-200 rounded mb-3 h-32 sm:h-40 flex items-center justify-center">
                  <span className="text-red-800 text-xs sm:text-sm font-medium">Casque sécurité</span>
                </div>
                <CardTitle className="text-base sm:text-lg mb-1">Casques de Sécurité Ventilés</CardTitle>
                <CardDescription className="mb-2 text-xs sm:text-sm">
                  EN397 • Confort longue durée
                </CardDescription>
                <div className="text-xs sm:text-sm text-stone-600">
                  Budget unitaire ~ {formatAmount(60000)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-stone-900 text-white rounded-lg p-6 sm:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif mb-3 sm:mb-4">
            Vous avez un projet innovant ?
          </h2>
          <p className="text-stone-300 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base px-2">
            Rejoignez notre communauté d'innovateurs et lancez votre campagne de financement participatif pour
            révolutionner le secteur du travail en hauteur.
          </p>
          <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-stone-900 text-sm sm:text-base px-6 sm:px-8">
            Proposer un Projet
          </Button>
        </div>
      </div>
    </div>
  )
}