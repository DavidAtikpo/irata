"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertCircle,
  CheckCircle,
  Upload,
  Filter,
  Download,
  MoreHorizontal,
} from "lucide-react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ProductsManagerPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fallback example (only used if API fails)


  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams()
        if (filterCategory && filterCategory !== 'all') params.set('category', filterCategory)
        if (searchQuery) params.set('search', searchQuery)
        const res = await fetch(`/api/client/products?${params.toString()}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Erreur lors du chargement')
        setProducts(data.products || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur lors du chargement')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory, searchQuery])

  const categories = [
    { value: "all", label: "Toutes les catégories" },
    { value: "Harnais", label: "Harnais" },
    { value: "Cordes", label: "Cordes" },
    { value: "Casques", label: "Casques" },
    { value: "Accessoires", label: "Accessoires" },
  ]

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) {
      return <Badge className="bg-red-100 text-red-800">Rupture</Badge>
    }
    if (stock <= 10) {
      return <Badge className="bg-amber-100 text-amber-800">Stock faible</Badge>
    }
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>
      case "inactive":
        return <Badge className="bg-stone-100 text-stone-800">Inactif</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string, stock: number) => {
    if (stock === 0) {
      return <AlertCircle className="h-4 w-4 text-red-600" />
    }
    if (stock <= 10) {
      return <AlertCircle className="h-4 w-4 text-amber-600" />
    }
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "all" || product.category === filterCategory
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "out_of_stock" && product.stock === 0) ||
      (filterStatus === "low_stock" && product.stock <= 10 && product.stock > 0) ||
      (filterStatus === "in_stock" && product.stock > 10)
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter((p) => (p.status || p.isActive ? 'active' : 'inactive') === "active").length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    lowStock: products.filter((p) => p.stock <= 10 && p.stock > 0).length,
    totalValue: products.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.stock || 0), 0),
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 font-playfair mb-2">Gestion des Produits</h1>
        <p className="text-stone-600">Gérez votre catalogue de matériaux cordiste</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Total Produits</p>
                <p className="text-2xl font-bold text-stone-900">{stats.totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeProducts}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Rupture</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Stock Faible</p>
                <p className="text-2xl font-bold text-amber-600">{stats.lowStock}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Valeur Stock</p>
                <p className="text-2xl font-bold text-stone-900">€{stats.totalValue.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-stone-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom ou SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les stocks</SelectItem>
                  <SelectItem value="in_stock">En stock</SelectItem>
                  <SelectItem value="low_stock">Stock faible</SelectItem>
                  <SelectItem value="out_of_stock">Rupture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-stone-900 hover:bg-stone-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Produit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau produit</DialogTitle>
                    <DialogDescription>Créez un nouveau produit dans votre catalogue</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nom du produit *</Label>
                        <Input id="product-name" placeholder="Harnais Professionnel..." />
                      </div>
                      <div className="space-y-2">
                        <Label>SKU *</Label>
                        <Input id="product-sku" placeholder="HAR-001" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description *</Label>
                      <Textarea id="product-description" placeholder="Description détaillée du produit..." rows={3} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Catégorie *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="harnais">Harnais</SelectItem>
                            <SelectItem value="cordes">Cordes</SelectItem>
                            <SelectItem value="casques">Casques</SelectItem>
                            <SelectItem value="accessoires">Accessoires</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Marque</Label>
                        <Input id="product-brand" placeholder="IRATA Pro" />
                      </div>
                      <div className="space-y-2">
                        <Label>Poids (kg)</Label>
                        <Input id="product-weight" type="number" step="0.1" placeholder="1.2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Prix (€) *</Label>
                        <Input id="product-price" type="number" step="0.01" placeholder="299.99" />
                      </div>
                      <div className="space-y-2">
                        <Label>Stock initial *</Label>
                        <Input id="product-stock" type="number" placeholder="25" />
                      </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-2">
                      <Label>Images du produit</Label>
                      <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center">
                        <Upload className="h-8 w-8 text-stone-400 mx-auto mb-2" />
                        <p className="text-sm text-stone-600">
                          Glissez-déposez vos images ici ou cliquez pour sélectionner
                        </p>
                        <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                          Choisir des fichiers
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Annuler</Button>
                    <Button className="bg-stone-900 hover:bg-stone-800" onClick={async () => {
                      const payload = {
                        name: (document.getElementById('product-name') as HTMLInputElement)?.value,
                        sku: (document.getElementById('product-sku') as HTMLInputElement)?.value,
                        description: (document.getElementById('product-description') as HTMLTextAreaElement)?.value,
                        price: (document.getElementById('product-price') as HTMLInputElement)?.value,
                        stock: (document.getElementById('product-stock') as HTMLInputElement)?.value,
                        brand: (document.getElementById('product-brand') as HTMLInputElement)?.value,
                        weight: (document.getElementById('product-weight') as HTMLInputElement)?.value,
                        // TODO: wire real categoryId from select; using placeholder for now
                        categoryId: 'temp-category-id',
                        images: [],
                        specifications: {},
                      }
                      try {
                        const res = await fetch('/api/client/products', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        })
                        const data = await res.json()
                        if (!res.ok) throw new Error(data.error || 'Erreur lors de la création du produit')
                        // Refresh list
                        setProducts(prev => [data, ...prev])
                      } catch (e) {
                        console.error(e)
                        alert(e instanceof Error ? e.message : 'Erreur lors de la création du produit')
                      }
                    }}>Créer le produit</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Produits ({filteredProducts.length})</CardTitle>
          <CardDescription>Gérez votre catalogue de matériaux cordiste</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Ventes</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        width={50}
                        height={50}
                        className="rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-stone-600">{product.brand}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-stone-100 px-2 py-1 rounded">{product.sku}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">€{product.price}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(product.status, product.stock)}
                      <span className={product.stock <= 10 ? "font-semibold text-amber-600" : ""}>{product.stock}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">{product.sales}</p>
                  </TableCell>
                  <TableCell>{getStatusBadge(product.status, product.stock)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Package className="h-4 w-4 mr-2" />
                          Gérer stock
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
