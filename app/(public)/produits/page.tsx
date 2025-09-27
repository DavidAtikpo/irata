"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Heart, Star, Search, Grid, List } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: {
    id: string
    name: string
    slug: string
  }
  stock: number
  brand?: string
  sku?: string
  weight?: number
  dimensions?: string
  tags: string[]
  views: number
  standards?: string
  ceMarking: boolean
  serialNumber?: string
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function ProductsPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("popular")
  const [filterCategory, setFilterCategory] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Charger les produits et catégories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Charger les catégories
        const categoriesRes = await fetch('/api/client/categories')
        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          setCategories(categoriesData)
        }

        // Charger les produits
        const productsRes = await fetch(`/api/client/products?page=${currentPage}&limit=12&search=${searchTerm}&category=${filterCategory}`)
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          console.log('Produits reçus:', productsData)
          setProducts(productsData.products || [])
          setTotalPages(productsData.pagination?.totalPages || 1)
        } else {
          console.error('Erreur API produits:', productsRes.status)
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPage, searchTerm, filterCategory])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setFilterCategory(value)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/public" className="text-2xl font-bold text-stone-900 font-playfair">
              a-finpart Store
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-stone-600 hover:text-stone-900">
                Accueil
              </Link>
              <Link href="/produits" className="text-amber-600 font-semibold">
                Produits
              </Link>
              <Link href="/categories" className="text-stone-600 hover:text-stone-900">
                Catégories
              </Link>
              <Link href="/financement" className="text-stone-600 hover:text-stone-900">
                Financement
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <ShoppingCart className="h-4 w-4" />
                <span className="ml-1 text-xs bg-amber-500 text-white rounded-full px-1">3</span>
              </Button>
              <Link href="/public/login">
                <Button size="sm" className="bg-stone-900 hover:bg-stone-800">
                  Connexion
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-stone-900 font-playfair mb-4">Nos Produits</h1>
          <p className="text-stone-600 max-w-2xl">
            Découvrez notre gamme complète d'équipements professionnels pour le travail en hauteur, tous certifiés selon
            les normes IRATA les plus strictes.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
                <Input 
                  placeholder="Rechercher un produit..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Select value={filterCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Plus populaires</SelectItem>
                  <SelectItem value="price-low">Prix croissant</SelectItem>
                  <SelectItem value="price-high">Prix décroissant</SelectItem>
                  <SelectItem value="rating">Mieux notés</SelectItem>
                  <SelectItem value="newest">Plus récents</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="h-48 bg-stone-200 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-stone-200 rounded mb-2"></div>
                  <div className="h-6 bg-stone-200 rounded mb-4"></div>
                  <div className="h-8 bg-stone-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-stone-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-stone-600">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
            }`}
          >
            {products.map((product) => (
              <Card
                key={product.id}
                className={`group hover:shadow-lg transition-shadow ${viewMode === "list" ? "flex flex-row" : ""}`}
              >
                <CardHeader className={`p-0 ${viewMode === "list" ? "w-48 flex-shrink-0" : ""}`}>
                  <div className="relative">
                    <Image
                      src={
                        (product.images && product.images.length > 0) 
                          ? product.images[0] 
                          : "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
                      }
                      alt={product.name}
                      width={400}
                      height={300}
                      className={`w-full object-cover ${
                        viewMode === "list" ? "h-full rounded-l-lg" : "h-48 rounded-t-lg"
                      }`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
                      }}
                    />
                    {product.ceMarking && (
                      <Badge className="absolute top-3 left-3 bg-green-500 text-white">CE</Badge>
                    )}
                    {product.stock === 0 && (
                      <Badge className="absolute top-3 right-3 bg-red-500">Rupture</Badge>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute bottom-3 right-3 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{product.category.name}</Badge>
                  </div>
                  <CardTitle
                    className={`group-hover:text-amber-600 transition-colors mb-2 ${
                      viewMode === "list" ? "text-xl" : "text-lg"
                    }`}
                  >
                    {product.name}
                  </CardTitle>
                  {viewMode === "list" && (
                    <p className="text-stone-600 mb-4 line-clamp-2">{product.description}</p>
                  )}
                  <div className={`flex items-center ${viewMode === "list" ? "justify-between" : "justify-between"}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-stone-900">€{product.price.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/produits/${product.id}`)}
                      >
                        Voir détails
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-stone-900 hover:bg-stone-800" 
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        {product.stock > 0 ? "Ajouter" : "Indisponible"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Précédent
              </Button>
              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index + 1}
                  variant={currentPage === index + 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
              <Button 
                variant="outline" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
