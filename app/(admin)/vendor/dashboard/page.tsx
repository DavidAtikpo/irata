"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Edit,
  Trash2,
  Star,
  MessageSquare,
  Percent,
  Truck,
  CreditCard,
  Eye,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  images: string[]
  category: {
    id: string
    name: string
    slug: string
  }
  inStock: boolean
  rating: number
  reviews: number
  brand?: string
  sku?: string
  weight?: number
  dimensions?: string
  tags: string[]
  quantity: number
  views: number
  createdAt: string
  updatedAt: string
}

interface Order {
  id: string
  total: number
  status: string
  createdAt: string
  user: {
    name: string
    email: string
  }
  items: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
    }
  }[]
}

interface ExtendedVendorStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  totalCustomers: number
  averageOrderValue: number
  totalPromotions: number
  activePromotions: number
  totalSupportTickets: number
  openSupportTickets: number
  totalReviews: number
  averageRating: number
  monthlyRevenue: number[]
  topSellingProducts: { name: string; sales: number }[]
  recentActivity: { type: string; message: string; date: string }[]
  paymentStats: {
    stripe: number
    paypal: number
    pending: number
  }
  shippingStats: {
    delivered: number
    shipped: number
    processing: number
  }
}

export default function VendorDashboard() {
  const { data: session, status } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<ExtendedVendorStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    totalPromotions: 0,
    activePromotions: 0,
    totalSupportTickets: 0,
    openSupportTickets: 0,
    totalReviews: 0,
    averageRating: 0,
    monthlyRevenue: [],
    topSellingProducts: [],
    recentActivity: [],
    paymentStats: { stripe: 0, paypal: 0, pending: 0 },
    shippingStats: { delivered: 0, shipped: 0, processing: 0 },
  })
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state for product
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    inStock: true,
  })

  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      redirect("/sign-in")
      return
    }
    if (session?.user?.role !== "ADMIN") {
      redirect("/sign-in")
      return
    }
    fetchVendorData()
  }, [session, status])

  const fetchVendorData = async () => {
    try {
      setLoading(true)
      const [productsRes, ordersRes, statsRes] = await Promise.all([
        fetch("/api/vendor/products"),
        fetch("/api/vendor/orders"),
        fetch("/api/vendor/stats"),
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(Array.isArray(productsData) ? productsData : (productsData.products ?? []))
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(Array.isArray(ordersData) ? ordersData : (ordersData.orders ?? []))
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/vendor/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...productForm,
          price: Number.parseFloat(productForm.price),
        }),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Produit ajouté avec succès",
        })
        setIsAddProductOpen(false)
        setProductForm({
          name: "",
          description: "",
          price: "",
          image: "",
          category: "",
          inStock: true,
        })
        fetchVendorData()
      } else {
        throw new Error("Erreur lors de l'ajout du produit")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    try {
      const response = await fetch(`/api/vendor/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...productForm,
          price: Number.parseFloat(productForm.price),
        }),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Produit modifié avec succès",
        })
        setEditingProduct(null)
        setProductForm({
          name: "",
          description: "",
          price: "",
          image: "",
          category: "",
          inStock: true,
        })
        fetchVendorData()
      } else {
        throw new Error("Erreur lors de la modification du produit")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le produit",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) return

    try {
      const response = await fetch(`/api/vendor/products/${productId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Produit supprimé avec succès",
        })
        fetchVendorData()
      } else {
        throw new Error("Erreur lors de la suppression du produit")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive",
      })
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/vendor/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Statut de la commande mis à jour",
        })
        fetchVendorData()
      } else {
        throw new Error("Erreur lors de la mise à jour du statut")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      image: product.image || "",
      category: product.category?.id || "",
      inStock: product.inStock,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tableau de bord vendeur</h1>
          <p className="text-muted-foreground">Vue d'ensemble complète de votre activité</p>
        </div>
        <Link href="/vendor/products/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un produit
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">+2 ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingOrders} en attente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">Panier moyen: {stats.averageOrderValue.toFixed(2)} €</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Clients uniques</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avis</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">{stats.totalReviews} avis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openSupportTickets}</div>
            <p className="text-xs text-muted-foreground">{stats.totalSupportTickets} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promotions</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePromotions}</div>
            <p className="text-xs text-muted-foreground">{stats.totalPromotions} créées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livraisons</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shippingStats.delivered}</div>
            <p className="text-xs text-muted-foreground">{stats.shippingStats.shipped} expédiées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paiements</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paymentStats.stripe + stats.paymentStats.paypal}</div>
            <p className="text-xs text-muted-foreground">{stats.paymentStats.pending} en attente</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Produits les plus vendus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topSellingProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{index + 1}</Badge>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{product.sales} ventes</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activité récente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des paiements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Stripe</span>
                    <span>{stats.paymentStats.stripe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PayPal</span>
                    <span>{stats.paymentStats.paypal}</span>
                  </div>
                  <div className="flex justify-between text-orange-600">
                    <span>En attente</span>
                    <span>{stats.paymentStats.pending}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>État des livraisons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Livrées</span>
                    <span className="text-green-600">{stats.shippingStats.delivered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expédiées</span>
                    <span className="text-blue-600">{stats.shippingStats.shipped}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>En cours</span>
                    <span className="text-orange-600">{stats.shippingStats.processing}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/vendor/products/add">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un produit
                  </Button>
                </Link>
                <Link href="/vendor/promotions">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Percent className="mr-2 h-4 w-4" />
                    Créer une promotion
                  </Button>
                </Link>
                <Link href="/vendor/support">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Support client
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenus mensuels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {stats.monthlyRevenue.map((revenue, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="bg-primary w-8 rounded-t"
                        style={{ height: `${(revenue / Math.max(...stats.monthlyRevenue)) * 200}px` }}
                      ></div>
                      <span className="text-xs mt-2">M{index + 1}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métriques clés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Taux de conversion</span>
                  <Badge>3.2%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Temps de traitement moyen</span>
                  <Badge>2.1 jours</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Taux de retour</span>
                  <Badge variant="secondary">1.8%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Satisfaction client</span>
                  <Badge variant="secondary">4.6/5</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Mes Produits</h2>
            <div className="flex gap-2">
              <Link href="/vendor/products/add">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un produit
                </Button>
              </Link>
            </div>
          </div>

          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Prix</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Vues</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={
                            (product.images && product.images.length > 0) 
                              ? product.images[0] 
                              : product.image || "/placeholder.svg"
                          }
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.price.toFixed(2)} €</TableCell>
                      <TableCell>{product.category?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={product.inStock ? "default" : "secondary"}>
                          {product.inStock ? "En stock" : "Rupture"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{product.views}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <h2 className="text-2xl font-bold">Commandes</h2>
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Commande</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.slice(-8)}</TableCell>
                      <TableCell>{order.user.name}</TableCell>
                      <TableCell>{order.total.toFixed(2)} €</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "DELIVERED"
                              ? "default"
                              : order.status === "SHIPPED"
                                ? "secondary"
                                : "secondary"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => handleUpdateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">En attente</SelectItem>
                            <SelectItem value="PROCESSING">En cours</SelectItem>
                            <SelectItem value="SHIPPED">Expédié</SelectItem>
                            <SelectItem value="DELIVERED">Livré</SelectItem>
                            <SelectItem value="CANCELLED">Annulé</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
            <DialogDescription>Modifiez les informations du produit ci-dessous.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditProduct}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Nom
                </Label>
                <Input
                  id="edit-name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Prix
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Catégorie
                </Label>
                <Select
                  value={productForm.category}
                  onValueChange={(value) => setProductForm({ ...productForm, category: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="harnais">Harnais</SelectItem>
                    <SelectItem value="cordes">Cordes</SelectItem>
                    <SelectItem value="casques">Casques</SelectItem>
                    <SelectItem value="accessoires">Accessoires</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-image" className="text-right">
                  Image URL
                </Label>
                <Input
                  id="edit-image"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Sauvegarder les modifications</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
