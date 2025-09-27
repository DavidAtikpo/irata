"use client"

import { useState, useEffect } from 'react'

export interface Order {
  id: string
  orderNumber?: string
  date: string
  status: string
  total: number
  shippingCost?: number
  items: {
    id: number
    name: string
    quantity: number
    price: number
    image?: string
  }[]
  shippingAddress?: {
    name: string
    address: string
    city: string
    country: string
  }
  trackingNumber?: string | null
  estimatedDelivery?: string
}

export interface Investment {
  id: number
  project: string
  description?: string
  image?: string
  investmentAmount: number
  investmentDate: string
  projectProgress: number
  targetAmount?: number
  currentAmount?: number
  backers?: number
  daysLeft?: number
  status: string
  expectedReturn: string
  actualReturn?: string
  category?: string
  updates: Array<{
    date: string
    title: string
    description: string
  }>
  rewards: {
    title: string
    description: string
    estimated_delivery: string
  }
}

export interface DashboardStats {
  totalOrders: number
  totalInvestments: number
  totalSpent: number
  loyaltyPoints: number
}

// Hook pour récupérer les statistiques du dashboard
export function useDashboardStats(userId: string) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        
        // Récupérer les commandes
        const ordersResponse = await fetch(`/api/client/orders?userId=${userId}`)
        const ordersData = await ordersResponse.json()
        
        // Récupérer les investissements
        const investmentsResponse = await fetch(`/api/client/investments?userId=${userId}`)
        const investmentsData = await investmentsResponse.json()

        const orders = ordersData.orders || []
        const investments = investmentsData.investments || []

        const totalSpent = orders.reduce((sum: number, order: any) => sum + order.total, 0)
        const totalInvested = investments.reduce((sum: number, inv: any) => sum + inv.amount, 0)

        setStats({
          totalOrders: orders.length,
          totalInvestments: investments.length,
          totalSpent: totalSpent,
          loyaltyPoints: Math.floor(totalSpent * 0.1) // 10% du montant dépensé en points
        })
      } catch (err) {
        setError('Erreur lors du chargement des statistiques')
        console.error('Error fetching dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchStats()
    }
  }, [userId])

  return { stats, loading, error }
}

// Hook pour récupérer les commandes récentes
export function useRecentOrders(userId: string, limit: number = 3) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        const response = await fetch(`/api/client/orders?userId=${userId}&limit=${limit}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors du chargement des commandes')
        }

        // Transformer les données de l'API vers le format attendu
        const transformedOrders = data.orders.map((order: any) => ({
          id: order.id,
          orderNumber: `CMD-${order.id.slice(-8)}`,
          date: new Date(order.createdAt).toLocaleDateString('fr-FR'),
          status: order.status.toLowerCase(),
          total: order.total,
          shippingCost: order.shippingCost || 0,
          items: order.items.map((item: any) => ({
            id: item.id,
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
            image: item.product.images?.[0] || '/placeholder.svg'
          })),
          trackingNumber: order.trackingNumber,
          estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('fr-FR') : undefined
        }))

        setOrders(transformedOrders)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
        console.error('Error fetching orders:', err)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchOrders()
    }
  }, [userId, limit])

  return { orders, loading, error }
}

// Hook pour récupérer tous les investissements
export function useInvestments(userId: string) {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInvestments() {
      try {
        setLoading(true)
        const response = await fetch(`/api/client/investments?userId=${userId}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors du chargement des investissements')
        }

        // Transformer les données de l'API vers le format attendu
        const transformedInvestments = data.investments.map((investment: any) => ({
          id: investment.id,
          project: investment.project.title,
          description: `Projet d'investissement dans ${investment.project.title}`,
          image: investment.project.images?.[0] || '/placeholder.svg',
          investmentAmount: investment.amount,
          investmentDate: new Date(investment.createdAt).toLocaleDateString('fr-FR'),
          projectProgress: Math.random() * 100, // À remplacer par la vraie progression
          targetAmount: 150000, // À récupérer depuis les données du projet
          currentAmount: Math.floor(Math.random() * 150000), // À récupérer depuis les données du projet
          backers: Math.floor(Math.random() * 300), // À récupérer depuis les données du projet
          daysLeft: Math.floor(Math.random() * 90), // À calculer depuis les dates du projet
          status: investment.status.toLowerCase(),
          expectedReturn: "15%", // À récupérer depuis les données du projet
          category: "Formation", // À récupérer depuis les données du projet
          updates: [
            {
              date: new Date().toLocaleDateString('fr-FR'),
              title: "Mise à jour du projet",
              description: "Le projet progresse selon les prévisions"
            }
          ],
          rewards: {
            title: "Récompense Investisseur",
            description: "Accès privilégié aux services du projet",
            estimated_delivery: "Bientôt disponible"
          }
        }))

        setInvestments(transformedInvestments)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
        console.error('Error fetching investments:', err)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchInvestments()
    }
  }, [userId])

  return { investments, loading, error }
}

// Hook pour récupérer les investissements récents
export function useRecentInvestments(userId: string, limit: number = 3) {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInvestments() {
      try {
        setLoading(true)
        const response = await fetch(`/api/client/investments?userId=${userId}&limit=${limit}`)
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors du chargement des investissements')
        }

        // Transformer les données de l'API vers le format attendu
        const transformedInvestments = data.investments.map((investment: any) => ({
          id: investment.id,
          project: investment.project.title,
          investmentAmount: investment.amount,
          investmentDate: new Date(investment.createdAt).toLocaleDateString('fr-FR'),
          projectProgress: Math.random() * 100, // À remplacer par la vraie progression
          status: investment.status.toLowerCase(),
          expectedReturn: "15%", // À récupérer depuis les données du projet
        }))

        setInvestments(transformedInvestments)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
        console.error('Error fetching investments:', err)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchInvestments()
    }
  }, [userId, limit])

  return { investments, loading, error }
}

// Hook pour récupérer les informations utilisateur (temporaire jusqu'à l'authentification)
export function useCurrentUser() {
  // Pour le moment, on simule un utilisateur connecté
  // À remplacer par la vraie authentification
  return {
    user: {
      id: "user-demo-123",
      name: "Jean Dupont",
      email: "jean.dupont@example.com"
    },
    loading: false,
    error: null
  }
}
