"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  ArrowLeft, 
  Truck, 
  Shield, 
  Award,
  Plus,
  Minus,
  Share2
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Image from 'next/image'

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

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/client/products/${params.id}`)
        if (response.ok) {
          const data = await response.json()
          setProduct(data)
        } else {
          toast({
            title: "Erreur",
            description: "Produit non trouvé",
            variant: "destructive",
          })
          router.push('/produits')
        }
      } catch (error) {
        console.error('Erreur lors du chargement du produit:', error)
        toast({
          title: "Erreur",
          description: "Impossible de charger le produit",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, router])

  const handleAddToCart = async () => {
    if (!product) return

    try {
      setAddingToCart(true)
      
      // Simuler l'ajout au panier (vous pouvez implémenter votre logique de panier ici)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Succès",
        description: `${quantity} x ${product.name} ajouté au panier`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter au panier",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(false)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900 mb-4">Produit non trouvé</h1>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-lg">
              <Image
                src={product.images?.[selectedImage] ?? "/placeholder.svg"}
                alt={product.name ?? 'Produit'}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
            </div>
            
            {Array.isArray(product.images) && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-amber-500' : 'border-stone-200'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name ?? 'Produit'} ${index + 1}`}
                      width={150}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {product.category?.name && (
                  <Badge variant="secondary">{product.category.name}</Badge>
                )}
                {product.ceMarking && (
                  <Badge className="bg-green-500">CE</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-stone-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < 4 ? "text-amber-400 fill-current" : "text-stone-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-stone-600">(0 avis)</span>
              </div>

              <div className="text-3xl font-bold text-stone-900 mb-6">
                €{Number(product.price ?? 0).toFixed(2)}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-stone-600">{product.description}</p>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4">
              {product.brand && (
                <div>
                  <Label className="text-sm font-medium text-stone-500">Marque</Label>
                  <p className="text-stone-900">{product.brand}</p>
                </div>
              )}
              {product.sku && (
                <div>
                  <Label className="text-sm font-medium text-stone-500">SKU</Label>
                  <p className="text-stone-900 font-mono text-sm">{product.sku}</p>
                </div>
              )}
              {product.weight && (
                <div>
                  <Label className="text-sm font-medium text-stone-500">Poids</Label>
                  <p className="text-stone-900">{product.weight} kg</p>
                </div>
              )}
              {product.dimensions && (
                <div>
                  <Label className="text-sm font-medium text-stone-500">Dimensions</Label>
                  <p className="text-stone-900">{product.dimensions}</p>
                </div>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="quantity">Quantité</Label>
                <div className="flex items-center border border-stone-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    className="w-16 text-center border-0"
                    min="1"
                    max={product.stock ?? 0}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= (product.stock ?? 0)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-stone-500">
                  {(product.stock ?? 0)} en stock
                </span>
              </div>

              <Button
                onClick={handleAddToCart}
                disabled={addingToCart || (product.stock ?? 0) === 0}
                className="w-full bg-stone-900 hover:bg-stone-800 text-white py-3"
                size="lg"
              >
                {addingToCart ? (
                  "Ajout en cours..."
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Ajouter au panier
                  </>
                )}
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center">
                <Truck className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Livraison rapide</p>
                <p className="text-xs text-stone-500">24-48h</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Garantie</p>
                <p className="text-xs text-stone-500">2 ans</p>
              </div>
              <div className="text-center">
                <Award className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Certifié</p>
                <p className="text-xs text-stone-500">{product.standards || 'EN'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
