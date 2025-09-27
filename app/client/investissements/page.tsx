"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TrendingUp, Calendar, Euro, BarChart3, Eye, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react"
import Image from "next/image"
import { useCurrentUser, useInvestments } from "../hooks/useClientData"

export default function InvestmentsPage() {
  const [selectedTab, setSelectedTab] = useState("active")
  
  const { user } = useCurrentUser()
  const { investments, loading, error } = useInvestments(user?.id || '')


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Terminé</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-5 w-5 text-blue-600" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <TrendingUp className="h-5 w-5 text-stone-600" />
    }
  }

  const filteredInvestments = investments.filter((investment) => {
    if (selectedTab === "active") return investment.status === "active"
    if (selectedTab === "completed") return investment.status === "completed"
    return true
  })

  const totalInvested = investments.reduce((sum, inv) => sum + inv.investmentAmount, 0)
  const activeInvestments = investments.filter((inv) => inv.status === "active").length
  const completedInvestments = investments.filter((inv) => inv.status === "completed").length

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 font-playfair mb-2">Mes Investissements</h1>
        <p className="text-stone-600">Suivez vos projets de financement participatif</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Total Investi</p>
                <p className="text-2xl font-bold text-stone-900">€{totalInvested}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <Euro className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Projets Actifs</p>
                <p className="text-2xl font-bold text-stone-900">{activeInvestments}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Projets Terminés</p>
                <p className="text-2xl font-bold text-stone-900">{completedInvestments}</p>
              </div>
              <div className="p-3 rounded-full bg-amber-50">
                <BarChart3 className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-stone-100 p-1 rounded-lg w-fit">
        <Button
          variant={selectedTab === "all" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab("all")}
          className={selectedTab === "all" ? "bg-white shadow-sm" : ""}
        >
          Tous ({investments.length})
        </Button>
        <Button
          variant={selectedTab === "active" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab("active")}
          className={selectedTab === "active" ? "bg-white shadow-sm" : ""}
        >
          En cours ({activeInvestments})
        </Button>
        <Button
          variant={selectedTab === "completed" ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedTab("completed")}
          className={selectedTab === "completed" ? "bg-white shadow-sm" : ""}
        >
          Terminés ({completedInvestments})
        </Button>
      </div>

      {/* Investments List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-3">Chargement des investissements...</span>
        </div>
      ) : error ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Erreur de chargement</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredInvestments.map((investment) => (
          <Card key={investment.id} className="overflow-hidden">
            <CardHeader className="bg-stone-50 border-b border-stone-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(investment.status)}
                  <div>
                    <CardTitle className="text-lg">{investment.project}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Investi le {investment.investmentDate}
                      </span>
                      <Badge variant="secondary">{investment.category}</Badge>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(investment.status)}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Détails
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{investment.project}</DialogTitle>
                        <DialogDescription>Votre investissement de €{investment.investmentAmount}</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* Project Image */}
                        <div className="relative h-48 rounded-lg overflow-hidden">
                          <Image
                            src={investment.image || "/placeholder.svg"}
                            alt={investment.project}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Progress */}
                        <div className="p-4 bg-stone-50 rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold">Progression du projet</h4>
                            <span className="text-2xl font-bold text-green-600">{investment.projectProgress}%</span>
                          </div>
                          <Progress value={investment.projectProgress} className="h-3 mb-3" />
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="text-center">
                              <p className="font-semibold">€{(investment.currentAmount || 0).toLocaleString()}</p>
                              <p className="text-stone-600">Collecté</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold">{investment.backers || 0}</p>
                              <p className="text-stone-600">Contributeurs</p>
                            </div>
                            <div className="text-center">
                              <p className="font-semibold">
                                {investment.status === "completed" ? "Terminé" : `${investment.daysLeft || 0} jours`}
                              </p>
                              <p className="text-stone-600">Restants</p>
                            </div>
                          </div>
                        </div>

                        {/* Your Investment */}
                        <div className="p-4 border border-stone-200 rounded-lg">
                          <h4 className="font-semibold mb-3">Votre investissement</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-stone-600">Montant investi</p>
                              <p className="text-xl font-bold">€{investment.investmentAmount}</p>
                            </div>
                            <div>
                              <p className="text-sm text-stone-600">Rendement attendu</p>
                              <p className="text-xl font-bold text-green-600">
                                {investment.actualReturn || investment.expectedReturn}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Reward */}
                        <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                          <h4 className="font-semibold mb-2">Votre récompense</h4>
                          <p className="font-medium">{investment.rewards.title}</p>
                          <p className="text-sm text-stone-600 mb-2">{investment.rewards.description}</p>
                          <p className="text-sm">
                            <span className="font-medium">Livraison estimée:</span>{" "}
                            {investment.rewards.estimated_delivery}
                          </p>
                        </div>

                        {/* Updates */}
                        <div>
                          <h4 className="font-semibold mb-4">Dernières mises à jour</h4>
                          <div className="space-y-3">
                            {investment.updates.map((update, index) => (
                              <div key={index} className="p-3 border border-stone-200 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <h5 className="font-medium">{update.title}</h5>
                                  <span className="text-xs text-stone-500">{update.date}</span>
                                </div>
                                <p className="text-sm text-stone-600">{update.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Investment Details */}
                <div>
                  <h4 className="font-semibold mb-3">Détails de l'investissement</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-stone-600">Montant investi:</span>
                      <span className="font-semibold">€{investment.investmentAmount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">Rendement attendu:</span>
                      <span className="font-semibold text-green-600">
                        {investment.actualReturn || investment.expectedReturn}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-600">Date d'investissement:</span>
                      <span>{investment.investmentDate}</span>
                    </div>
                  </div>
                </div>

                {/* Project Progress */}
                <div>
                  <h4 className="font-semibold mb-3">Progression du projet</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">Progression</span>
                      <span className="font-semibold">{investment.projectProgress}%</span>
                    </div>
                    <Progress value={investment.projectProgress} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-600">
                        €{(investment.currentAmount || 0).toLocaleString()} / €{(investment.targetAmount || 0).toLocaleString()}
                      </span>
                      <span className="text-stone-600">
                        {investment.status === "completed" ? "Terminé" : `${investment.daysLeft || 0} jours restants`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {!loading && !error && filteredInvestments.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Aucun investissement trouvé</h3>
            <p className="text-stone-600 mb-6">
              {selectedTab === "active"
                ? "Vous n'avez pas d'investissements actifs."
                : selectedTab === "completed"
                  ? "Vous n'avez pas d'investissements terminés."
                  : "Vous n'avez pas encore investi dans des projets."}
            </p>
            <Button asChild>
              <a href="/public/financement">Découvrir les projets</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
