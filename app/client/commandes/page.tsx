"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Package,
  Search,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
  CreditCard,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCurrentUser, Order } from "../hooks/useClientData"

export default function OrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useCurrentUser()

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.id) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/client/orders?userId=${user.id}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors du chargement des commandes')
        }

        // Transformer les données de l'API vers le format attendu
        const transformedOrders = data.orders.map((order: any) => ({
          id: order.id,
          orderNumber: `IRATA-${order.id.slice(-8)}-2024`,
          date: new Date(order.createdAt).toLocaleDateString('fr-FR'),
          status: order.status.toLowerCase(),
          total: order.total,
          shippingCost: order.shippingCost || 9.99,
          items: order.items.map((item: any) => ({
            id: item.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
            image: item.product.images?.[0] || '/placeholder.svg'
          })),
          shippingAddress: {
            name: user.name || 'Client',
            address: "123 Rue de la Paix",
            city: "75001 Paris", 
            country: "France"
          },
          trackingNumber: order.trackingNumber,
          estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('fr-FR') : new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString('fr-FR')
        }))

        setOrders(transformedOrders)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
        console.error('Error fetching orders:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user?.id])


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Livré</Badge>
      case "shipped":
        return <Badge className="bg-blue-100 text-blue-800">Expédié</Badge>
      case "processing":
        return <Badge className="bg-amber-100 text-amber-800">En cours</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Annulé</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "shipped":
        return <Truck className="h-5 w-5 text-blue-600" />
      case "processing":
        return <Clock className="h-5 w-5 text-amber-600" />
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Package className="h-5 w-5 text-stone-600" />
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 font-playfair mb-2">Mes Commandes</h1>
        <p className="text-stone-600">Suivez l'état de vos commandes et leur livraison</p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par numéro de commande ou produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="processing">En cours</SelectItem>
                <SelectItem value="shipped">Expédié</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-3">Chargement des commandes...</span>
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
          {filteredOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="bg-stone-50 border-b border-stone-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(order.status)}
                  <div>
                    <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {order.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-4 w-4" />€{order.total}
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Détails
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Détails de la commande {order.orderNumber}</DialogTitle>
                        <DialogDescription>Commande passée le {order.date}</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* Status */}
                        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(order.status)}
                            <div>
                              <p className="font-semibold">Statut de la commande</p>
                              <p className="text-sm text-stone-600">
                                {order.status === "delivered" && "Votre commande a été livrée"}
                                {order.status === "shipped" && "Votre commande est en cours de livraison"}
                                {order.status === "processing" && "Votre commande est en cours de préparation"}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>

                        {/* Tracking */}
                        {order.trackingNumber && (
                          <div className="p-4 border border-stone-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold">Suivi de livraison</p>
                                <p className="text-sm text-stone-600">Numéro de suivi: {order.trackingNumber}</p>
                                <p className="text-sm text-stone-600">Livraison estimée: {order.estimatedDelivery}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Truck className="h-4 w-4 mr-2" />
                                Suivre
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Items */}
                        <div>
                          <h4 className="font-semibold mb-4">Articles commandés</h4>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center space-x-4 p-3 border border-stone-200 rounded-lg"
                              >
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  width={60}
                                  height={60}
                                  className="rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold">{item.name}</p>
                                  <p className="text-sm text-stone-600">Quantité: {item.quantity}</p>
                                </div>
                                <p className="font-semibold">€{item.price}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div>
                          <h4 className="font-semibold mb-3">Adresse de livraison</h4>
                          <div className="p-4 bg-stone-50 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <MapPin className="h-5 w-5 text-stone-600 mt-0.5" />
                              <div>
                                <p className="font-semibold">{order.shippingAddress?.name}</p>
                                <p className="text-stone-600">{order.shippingAddress?.address}</p>
                                <p className="text-stone-600">{order.shippingAddress?.city}</p>
                                <p className="text-stone-600">{order.shippingAddress?.country}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="border-t border-stone-200 pt-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Sous-total</span>
                              <span>€{(order.total - (order.shippingCost ?? 0)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Frais de livraison</span>
                              <span>€{order.shippingCost}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-lg border-t border-stone-200 pt-2">
                              <span>Total</span>
                              <span>€{order.total}</span>
                            </div>
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
                {/* Items Preview */}
                <div>
                  <h4 className="font-semibold mb-3">Articles ({order.items.length})</h4>
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-stone-600">Qté: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">€{item.price}</p>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-sm text-stone-600">+{order.items.length - 2} autre(s) article(s)</p>
                    )}
                  </div>
                </div>

                {/* Delivery Info */}
                <div>
                  <h4 className="font-semibold mb-3">Informations de livraison</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-stone-600" />
                      <span>{order.shippingAddress?.city}</span>
                    </div>
                    {order.trackingNumber && (
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-stone-600" />
                        <span>Suivi: {order.trackingNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-stone-600" />
                      <span>Livraison prévue: {order.estimatedDelivery}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {!loading && !error && filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Aucune commande trouvée</h3>
            <p className="text-stone-600 mb-6">
              {searchQuery || selectedStatus !== "all"
                ? "Aucune commande ne correspond à vos critères de recherche."
                : "Vous n'avez pas encore passé de commande."}
            </p>
            <Link href="/public/produits">
              <Button>Découvrir nos produits</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
