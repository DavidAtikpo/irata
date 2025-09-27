"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  ShoppingBag,
  TrendingUp,
  Heart,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  User,
  CreditCard,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Dashboard",
    href: "/client/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Mes Commandes",
    href: "/client/commandes",
    icon: ShoppingBag,
  },
  {
    name: "Mes Investissements",
    href: "/client/investissements",
    icon: TrendingUp,
  },
  {
    name: "Favoris",
    href: "/client/favoris",
    icon: Heart,
  },
  {
    name: "Profil",
    href: "/client/profil",
    icon: User,
  },
  {
    name: "Paiements",
    href: "/client/paiements",
    icon: CreditCard,
  },
  {
    name: "Notifications",
    href: "/client/notifications",
    icon: Bell,
  },
  {
    name: "Paramètres",
    href: "/client/parametres",
    icon: Settings,
  },
]

export function ClientSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-md"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-stone-200">
            <Link href="/public" className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-amber-600" />
              <span className="text-xl font-bold text-stone-900 font-playfair">IRATA Store</span>
            </Link>
          </div>

          {/* User Profile */}
          <div className="p-6 border-b border-stone-200">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-amber-100 text-amber-700">JD</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-stone-900">Jean Dupont</p>
                <p className="text-xs text-stone-500">Client Premium</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-amber-50 text-amber-700 border-r-2 border-amber-600"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-900",
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-stone-200">
            <Button variant="ghost" className="w-full justify-start text-stone-600 hover:text-red-600">
              <LogOut className="h-5 w-5 mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
