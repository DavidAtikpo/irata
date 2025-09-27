"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Composant pour les éléments interactifs qui peuvent causer des problèmes d'hydratation
const ClientOnlyComponents = dynamic(() => Promise.resolve(({ children }: { children: React.ReactNode }) => <>{children}</>), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[400px] rounded-lg overflow-hidden shadow-2xl bg-stone-200 animate-pulse">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-stone-500">Chargement...</div>
      </div>
    </div>
  )
});
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Star, ArrowRight, Shield, Truck, Award, Users, Menu, X, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

// Hero Carousel Component
const HeroCarousel = (
  { images, intervalMs = 4000 }: { images: { src: string; alt?: string }[]; intervalMs?: number }
) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [images.length, intervalMs, isAutoPlaying]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden shadow-2xl">
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 sm:p-2 rounded-full transition-colors"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 sm:p-2 rounded-full transition-colors"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
      
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const FCFA_TO_EUR = 0.00152
  const formatEur = (fcfa: number) => `€${(fcfa * FCFA_TO_EUR).toLocaleString("fr-FR")}`
  
  // Charger les produits réels
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/client/products?limit=9');
        if (response.ok) {
          const data = await response.json();
          setFeaturedProducts(data.products || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        // Fallback vers des produits statiques en cas d'erreur
        setFeaturedProducts([
          {
            id: 1,
            name: "Harnais Professionnel ",
            price: 299.99,
            originalPrice: 349.99,
            images: ["/professional-climbing-harness.jpg"],
            rating: 4.8,
            reviews: 124,
            badge: "Bestseller",
          },
          {
            id: 2,
            name: "Corde Statique 11mm - 50m",
            price: 189.99,
            images: ["/static-climbing-rope.jpg"],
            rating: 4.9,
            reviews: 89,
            badge: "Nouveau",
          },
          {
            id: 3,
            name: "Casque de Sécurité Pro",
            price: 79.99,
            images: ["/safety-helmet-climbing.jpg"],
            rating: 4.7,
            reviews: 156,
            badge: "Promo",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const crowdfundingProjects = [
    {
      id: 1,
      title: "Centre Multi-Formations Sécurité — Togo",
      description: "Matériel cordiste  • Appareil à ultrasons CND • Équipement SST. Ce projet innovant vise à créer l'un des premiers centres de multi formations en sécurité au Togo.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJZWpkk63XHzqohzMf8CsAwW3_U2zsqWA55Q&s",
      targetAmount: 15000000,
      currentAmount: 800000,
      backers: 2,
      daysLeft: 70,
    },
  ]

  const heroImages = [
    { src: "/produits/Screenshot_2025-08-11-10-32-12-504_com.alibaba.intl.android.apps.poseidon.jpg", alt: "Cordiste professionnel" },
    { src: "/produits/Screenshot_2025-08-11-10-24-43-137_com.alibaba.intl.android.apps.poseidon.jpg", alt: "Travail en hauteur" },
    { src: "/produits/Screenshot_2025-08-11-10-16-52-429_com.alibaba.intl.android.apps.poseidon.jpg", alt: "Centre de formation" },
    { src: "/produits/Screenshot_2025-08-11-11-43-43-862_com.alibaba.intl.android.apps.poseidon.jpg", alt: "Équipement sécurité" },
  ];

  return (
    <div className="min-h-screen bg-stone-50" suppressHydrationWarning>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl sm:text-2xl font-bold text-stone-900 font-serif">
                a-finpart Store
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link href="/produits" className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium">
                Produits
              </Link>
              <a href="/categories" className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium">
                Catégories
              </a>
              <a href="/financement" className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium">
                Financement
              </a>
              <a href="/about" className="text-stone-600 hover:text-stone-900 transition-colors text-sm font-medium">
                À Propos
              </a>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-2 lg:space-x-4">
              <Button variant="ghost" size="sm" className="p-2">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2 relative">
                <ShoppingCart className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 text-xs bg-amber-500 text-white rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">3</span>
              </Button>
              <Button onClick={() => router.push('/sign-in')} variant="outline" size="sm" className="text-xs sm:text-sm px-3 py-2">
                Connexion
              </Button>
              <Button onClick={() => router.push('/sign-up')} size="sm" className="bg-stone-900 hover:bg-stone-800 text-xs sm:text-sm px-3 py-2">
                S'inscrire
              </Button>
            </div>

            {/* Mobile Actions */}
            <div className="lg:hidden items-center space-x-2">
              <Button variant="ghost" size="sm" className="p-2 relative">
                <ShoppingCart className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 text-xs bg-amber-500 text-white rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">3</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-stone-200 py-4 bg-white">
              <nav className="flex flex-col space-y-4">
                <Link href="/produits" className="text-stone-600 hover:text-stone-900 transition-colors font-medium">
                  Produits
                </Link>
                <a href="/categories" className="text-stone-600 hover:text-stone-900 transition-colors font-medium">
                  Catégories
                </a>
                <a href="/financement" className="text-stone-600 hover:text-stone-900 transition-colors font-medium">
                  Financement Participatif
                </a>
                <a href="/about" className="text-stone-600 hover:text-stone-900 transition-colors font-medium">
                  À Propos
                </a>
                <div className="flex space-x-2 pt-4 border-t border-stone-100">
                  <Button variant="outline" size="sm" className="flex-1">
                    Connexion
                  </Button>
                  <Button size="sm" className="bg-stone-900 hover:bg-stone-800 flex-1">
                    S'inscrire
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-stone-700 text-white overflow-hidden">
        {/* <div className="absolute inset-0 bg-black/20"></div> */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4 sm:mb-6">
                Équipements Professionnels pour Cordistes
              </h1>
              <p className="text-sm sm:text-base lg:text-xl text-stone-200 mb-6 sm:mb-8 max-w-2xl mx-auto lg:mx-0">
                Découvrez notre gamme complète de matériaux certifiés et soutenez l'innovation dans le secteur du
                travail en hauteur grâce au financement participatif.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={() => router.push('/produits')}
                  size="lg" 
                  className="bg-amber-500 hover:bg-amber-600 text-stone-900 font-semibold text-sm sm:text-base px-6 py-3"
                >
                  Découvrir les Produits
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => router.push('/financement')}
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-stone-900 bg-transparent text-sm sm:text-base px-6 py-3"
                >
                  Projets à Financer
                </Button>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <ClientOnlyComponents>
                <HeroCarousel images={heroImages} intervalMs={4000} />
              </ClientOnlyComponents>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-1 sm:py-3 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-amber-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2 text-sm sm:text-base">Certifié</h3>
              <p className="text-stone-600 text-xs sm:text-sm">
                Tous nos équipements respectent les normes les plus strictes
              </p>
            </div>
            <div className="text-center">
              <div className="bg-amber-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2 text-sm sm:text-base">Livraison Rapide</h3>
              <p className="text-stone-600 text-xs sm:text-sm">Expédition sous 24h pour tous les produits en stock</p>
            </div>
            <div className="text-center">
              <div className="bg-amber-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2 text-sm sm:text-base">Garantie Qualité</h3>
              <p className="text-stone-600 text-xs sm:text-sm">Garantie constructeur étendue sur tous nos produits</p>
            </div>
            <div className="text-center">
              <div className="bg-amber-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2 text-sm sm:text-base">Support Expert</h3>
              <p className="text-stone-600 text-xs sm:text-sm">Conseils techniques par des professionnels certifiés</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-3 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 font-serif mb-4">Produits Phares</h2>
            <p className="text-stone-600 max-w-2xl mx-auto text-sm sm:text-base">
              Découvrez notre sélection d'équipements les plus populaires, choisis par les professionnels
            </p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="h-40 sm:h-48 bg-stone-200 rounded-t-lg"></div>
                  <CardContent className="p-4 sm:p-6">
                    <div className="h-4 bg-stone-200 rounded mb-2"></div>
                    <div className="h-6 bg-stone-200 rounded mb-4"></div>
                    <div className="h-8 bg-stone-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="p-0">
                    <div className="relative">
                      <img
                        src={
                          (product.images && product.images.length > 0) 
                            ? product.images[0] 
                            : "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
                        }
                        alt={product.name}
                        className="w-full h-40 sm:h-48 object-cover rounded-t-lg"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
                        }}
                      />
                      {product.badge && (
                        <Badge className="absolute top-3 left-3 bg-amber-500 text-stone-900 text-xs">{product.badge}</Badge>
                      )}
                      <Button size="sm" variant="ghost" className="absolute top-3 right-3 bg-white/80 hover:bg-white p-2">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 sm:h-4 sm:w-4 ${
                              i < Math.floor(product.rating || 4.5) ? "text-amber-400 fill-current" : "text-stone-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm text-stone-600">({product.reviews || 0})</span>
                    </div>
                    <CardTitle className="text-base sm:text-lg mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {product.name}
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-2xl font-bold text-stone-900">€{product.price?.toFixed(2) || '0.00'}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-stone-500 line-through">€{product.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full sm:w-auto"
                          onClick={() => router.push(`/produits/${product.id}`)}
                        >
                          Voir détails
                        </Button>
                        <Button size="sm" className="bg-stone-900 hover:bg-stone-800 w-full sm:w-auto">
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="text-center mt-8 sm:mt-4">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Voir Tous les Produits
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Crowdfunding Section */}
      <section className="py-1 sm:py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 font-serif mb-4">Financement Participatif</h2>
            <p className="text-stone-600 max-w-2xl mx-auto text-sm sm:text-base">
              Soutenez l'innovation et le développement de nouveaux projets dans le secteur du travail en hauteur
            </p>
          </div>
          <div className="max-w-7xl mx-auto px-4 ">
            {crowdfundingProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 sm:h-56">
                  <img src={project.image} alt={project.title} className="" />
                </div>
                <CardContent className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl mb-2 line-clamp-2">{project.title}</CardTitle>
                  <CardDescription className="mb-4 text-sm sm:text-base line-clamp-3">{project.description}</CardDescription>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-2">
                        <span className="text-stone-600">Collecté</span>
                        <span className="font-semibold">
                          {formatEur(project.currentAmount)} / {formatEur(project.targetAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-2">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min((project.currentAmount / project.targetAmount) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-stone-600">{project.backers} contributeurs</span>
                      <span className="text-stone-600">{project.daysLeft} jours restants</span>
                    </div>

                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-stone-900 text-sm sm:text-base py-2 sm:py-3">
                      Soutenir ce Projet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8 sm:mt-4">
            <Button onClick={() => router.push('/financement')} size="lg" variant="outline" className="w-full sm:w-auto">
              Voir Tous les Projets
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-lg sm:text-xl font-bold font-serif mb-3 sm:mb-4">a-finpart Store</h3>
              <p className="text-stone-300 text-xs sm:text-sm">
                Votre partenaire de confiance pour tous vos équipements de travail en hauteur.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Produits</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-300">
                <li><a href="/categories/harnais" className="hover:text-white transition-colors">Harnais</a></li>
                <li><a href="/categories/cordes" className="hover:text-white transition-colors">Cordes</a></li>
                <li><a href="/categories/casques" className="hover:text-white transition-colors">Casques</a></li>
                <li><a href="/categories/accessoires" className="hover:text-white transition-colors">Accessoires</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-300">
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="/livraison" className="hover:text-white transition-colors">Livraison</a></li>
                <li><a href="/retours" className="hover:text-white transition-colors">Retours</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Légal</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-300">
                <li><a href="/mentions-legales" className="hover:text-white transition-colors">Mentions Légales</a></li>
                <li><a href="/cgv" className="hover:text-white transition-colors">CGV</a></li>
                <li><a href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-stone-400">
            <p>&copy; 2025 a-finpart Store. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}