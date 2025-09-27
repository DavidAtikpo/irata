"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import {
  Search,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Users,
  ShoppingBag,
  TrendingUp,
  Mail,
  Phone,
  Calendar,
  Euro,
  Filter,
  Download,
  MoreHorizontal,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"

export default function ClientManagerPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedTab, setSelectedTab] = useState("clients")

  // Mock data for clients
  const clients = [
    {
      id: "1",
      name: "Jean Dupont",
      email: "jean.dupont@email.com",
      phone: "06 12 34 56 78",
      address: "123 Rue de la Paix, 75001 Paris",
      registrationDate: "2024-01-15",
      status: "active",
      totalOrders: 12,
      totalSpent: 3247.5,
      lastOrderDate: "2024-01-20",
      avatar: "/placeholder.svg",
    },
    {
      id: "2",
      name: "Marie Martin",
      email: "marie.martin@email.com",
      phone: "06 98 76 54 32",
      address: "456 Avenue des Champs, 69001 Lyon",
      registrationDate: "2024-01-10",
      status: "active",
      totalOrders: 8,
      totalSpent: 1890.75,
      lastOrderDate: "2024-01-18",
      avatar: "/placeholder.svg",
    },
    {
      id: "3",
      name: "Pierre Durand",
      email: "pierre.durand@email.com",
      phone: "06 11 22 33 44",
      address: "789 Boulevard Saint-Michel, 13001 Marseille",
      registrationDate: "2023-12-20",
      status: "inactive",
      totalOrders: 3,
      totalSpent: 567.25,
      lastOrderDate: "2023-12-25",
      avatar: "/placeholder.svg",
    },
  ]

  // Mock data for investors
  const investors = [
    {
      id: "1",
      name: "Jean Dupont",
      email: "jean.dupont@email.com",
      totalInvestments: 3,
      totalInvested: 2450.0,
      activeProjects: 2,
      completedProjects: 1,
      joinDate: "2024-01-10",
      status: "active",
      avatar: "/placeholder.svg",
    },
    {
      id: "2",
      name: "Sophie Bernard",
      email: "sophie.bernard@email.com",
      totalInvestments: 5,
      totalInvested: 5200.0,
      activeProjects: 3,
      completedProjects: 2,
      joinDate: "2023-11-15",
      status: "active",
      avatar: "/placeholder.svg",
    },
    {
      id: "3",
      name: "Marc Leroy",
      email: "marc.leroy@email.com",
      totalInvestments: 2,
      totalInvested: 1000.0,
      activeProjects: 1,
      completedProjects: 1,
      joinDate: "2023-12-01",
      status: "inactive",
      avatar: "/placeholder.svg",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>
      case "inactive":
        return <Badge className="bg-red-100 text-red-800">Inactif</Badge>
      case "suspended":
        return <Badge className="bg-amber-100 text-amber-800">Suspendu</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || client.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const filteredInvestors = investors.filter((investor) => {
    const matchesSearch =
      investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investor.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || investor.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter((c) => c.status === "active").length,
    totalInvestors: investors.length,
    activeInvestors: investors.filter((i) => i.status === "active").length,
    totalRevenue: clients.reduce((sum, c) => sum + c.totalSpent, 0),
    totalInvestments: investors.reduce((sum, i) => sum + i.totalInvested, 0),
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 font-playfair mb-2">Gestion des Clients</h1>
        <p className="text-stone-600">Gérez vos clients et investisseurs depuis cette interface</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Clients Totaux</p>
                <p className="text-2xl font-bold text-stone-900">{stats.totalClients}</p>
                <p className="text-xs text-green-600">{stats.activeClients} actifs</p>
              </div>
              <div className="p-3 rounded-full bg-blue-50">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Investisseurs</p>
                <p className="text-2xl font-bold text-stone-900">{stats.totalInvestors}</p>
                <p className="text-xs text-green-600">{stats.activeInvestors} actifs</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">CA Total</p>
                <p className="text-2xl font-bold text-stone-900">€{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-stone-500">Ventes produits</p>
              </div>
              <div className="p-3 rounded-full bg-amber-50">
                <ShoppingBag className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-600">Investissements</p>
                <p className="text-2xl font-bold text-stone-900">€{stats.totalInvestments.toLocaleString()}</p>
                <p className="text-xs text-stone-500">Financement participatif</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <Euro className="h-6 w-6 text-purple-600" />
              </div>
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
                  placeholder="Rechercher par nom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="inactive">Inactifs</SelectItem>
                  <SelectItem value="suspended">Suspendus</SelectItem>
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
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nouveau Client
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau client</DialogTitle>
                    <DialogDescription>Créez un nouveau compte client manuellement</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prénom</label>
                      <Input placeholder="Jean" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nom</label>
                      <Input placeholder="Dupont" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input type="email" placeholder="jean.dupont@email.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Téléphone</label>
                      <Input placeholder="06 12 34 56 78" />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-sm font-medium">Adresse</label>
                      <Input placeholder="123 Rue de la Paix, 75001 Paris" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Annuler</Button>
                    <Button className="bg-stone-900 hover:bg-stone-800">Créer le client</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="clients">Clients E-commerce ({filteredClients.length})</TabsTrigger>
          <TabsTrigger value="investors">Investisseurs ({filteredInvestors.length})</TabsTrigger>
        </TabsList>

        {/* Clients Tab */}
        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Liste des Clients</CardTitle>
              <CardDescription>Gérez vos clients e-commerce et leurs commandes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Commandes</TableHead>
                    <TableHead>Total Dépensé</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={client.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {client.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{client.name}</p>
                            <p className="text-sm text-stone-600">{client.address}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {client.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <p className="font-semibold">{client.totalOrders}</p>
                          <p className="text-xs text-stone-600">Dernière: {client.lastOrderDate}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">€{client.totalSpent.toLocaleString()}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {client.registrationDate}
                        </div>
                      </TableCell>
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
                              <Mail className="h-4 w-4 mr-2" />
                              Envoyer email
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
        </TabsContent>

        {/* Investors Tab */}
        <TabsContent value="investors">
          <Card>
            <CardHeader>
              <CardTitle>Liste des Investisseurs</CardTitle>
              <CardDescription>Gérez vos investisseurs et leurs participations aux projets</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investisseur</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Investissements</TableHead>
                    <TableHead>Total Investi</TableHead>
                    <TableHead>Projets</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvestors.map((investor) => (
                    <TableRow key={investor.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={investor.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {investor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{investor.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Mail className="h-3 w-3" />
                          {investor.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold">{investor.totalInvestments}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-green-600">€{investor.totalInvested.toLocaleString()}</p>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{investor.activeProjects} actifs</p>
                          <p className="text-stone-600">{investor.completedProjects} terminés</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(investor.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {investor.joinDate}
                        </div>
                      </TableCell>
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
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Historique investissements
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Envoyer email
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
