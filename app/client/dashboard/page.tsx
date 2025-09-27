"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ShoppingBag,
  TrendingUp,
  Euro,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { useDashboardStats, useRecentOrders, useRecentInvestments, useCurrentUser } from "../hooks/useClientData"

export default function ClientDashboard() {
  const { user } = useCurrentUser()
  const { stats, loading: statsLoading, error: statsError } = useDashboardStats(user?.id || '')
  const { orders: recentOrders, loading: ordersLoading, error: ordersError } = useRecentOrders(user?.id || '', 3)
  const { investments, loading: investmentsLoading, error: investmentsError } = useRecentInvestments(user?.id || '', 3)

  const dashboardStats = [
    {
      title: "Commandes Totales",
      value: statsLoading ? "..." : stats?.totalOrders?.toString() || "0",
      change: "+2 ce mois",
      icon: ShoppingBag,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Investissements",
      value: statsLoading ? "..." : stats?.totalInvestments?.toString() || "0",
      change: `€${stats?.totalSpent || 0} investis`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Dépenses Totales",
      value: statsLoading ? "..." : `€${stats?.totalSpent || 0}`,
      change: "+€450 ce mois",
      icon: Euro,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Points Fidélité",
      value: statsLoading ? "..." : stats?.loyaltyPoints?.toString() || "0",
      change: "+150 points",
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Livré</Badge>
      case "shipped":
        return <Badge className="bg-blue-100 text-blue-800">Expédié</Badge>
      case "processing":
        return <Badge className="bg-amber-100 text-amber-800">En cours</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "shipped":
        return <Package className="h-4 w-4 text-blue-600" />
      case "processing":
        return <Clock className="h-4 w-4 text-amber-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-stone-600" />
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 font-playfair mb-2">Dashboard</h1>
        <p className="text-stone-600">Bienvenue dans votre espace client IRATA Store</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
                  <p className="text-xs text-stone-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Commandes Récentes</CardTitle>
                <CardDescription>Vos dernières commandes et leur statut</CardDescription>
              </div>
              <Link href="/client/commandes">
                <Button variant="outline" size="sm">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Chargement des commandes...</span>
              </div>
            ) : ordersError ? (
              <div className="text-center py-8 text-red-600">
                <p>{ordersError}</p>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-stone-500">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune commande récente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border border-stone-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-semibold text-stone-900">{order.orderNumber || order.id}</p>
                        <p className="text-sm text-stone-600">
                          {order.items.length > 0 ? order.items[0].name : 'Commande'}
                          {order.items.length > 1 && ` +${order.items.length - 1} autre(s)`}
                        </p>
                        <p className="text-xs text-stone-500">{order.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(order.status)}
                      <p className="text-sm font-semibold text-stone-900 mt-1">€{order.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Investments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mes Investissements</CardTitle>
                <CardDescription>Suivi de vos projets de financement participatif</CardDescription>
              </div>
              <Link href="/client/investissements">
                <Button variant="outline" size="sm">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {investmentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Chargement des investissements...</span>
              </div>
            ) : investmentsError ? (
              <div className="text-center py-8 text-red-600">
                <p>{investmentsError}</p>
              </div>
            ) : investments.length === 0 ? (
              <div className="text-center py-8 text-stone-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun investissement récent</p>
              </div>
            ) : (
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div key={investment.id} className="p-4 border border-stone-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-stone-900">{investment.project}</h4>
                      <Badge className="bg-green-100 text-green-800">{investment.expectedReturn}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-600">Progression</span>
                        <span className="font-semibold">{investment.projectProgress.toFixed(1)}%</span>
                      </div>
                      <Progress value={investment.projectProgress} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-600">Votre investissement</span>
                        <span className="font-semibold">€{investment.investmentAmount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>Accédez rapidement aux fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/public/produits">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
              >
                <ShoppingBag className="h-6 w-6" />
                <span className="text-sm">Acheter</span>
              </Button>
            </Link>
            <Link href="/public/financement">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
              >
                <TrendingUp className="h-6 w-6" />
                <span className="text-sm">Investir</span>
              </Button>
            </Link>
            <Link href="/client/favoris">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
              >
                <Package className="h-6 w-6" />
                <span className="text-sm">Favoris</span>
              </Button>
            </Link>
            <Link href="/client/profil">
              <Button
                variant="outline"
                className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
              >
                <CheckCircle className="h-6 w-6" />
                <span className="text-sm">Profil</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
