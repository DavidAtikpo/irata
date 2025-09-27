"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { MessageCircle, Clock, CheckCircle, AlertTriangle, Search, Eye, MessageSquare } from "lucide-react"

interface SupportTicket {
  id: string
  customerName: string
  customerEmail: string
  subject: string
  category: string
  priority: string
  message: string
  status: string
  response: string | null
  createdAt: string
  updatedAt: string
}

const statusConfig = {
  open: { label: "Ouvert", color: "bg-blue-500" },
  in_progress: { label: "En cours", color: "bg-yellow-500" },
  resolved: { label: "Résolu", color: "bg-green-500" },
  closed: { label: "Fermé", color: "bg-gray-500" },
}

const priorityConfig = {
  low: { label: "Faible", color: "bg-gray-500" },
  medium: { label: "Moyenne", color: "bg-blue-500" },
  high: { label: "Élevée", color: "bg-orange-500" },
  urgent: { label: "Urgente", color: "bg-red-500" },
}

export default function VendorSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [response, setResponse] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchTickets()
  }, [])

  useEffect(() => {
    filterTickets()
  }, [tickets, searchQuery, statusFilter, priorityFilter])

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/support/tickets")
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les tickets.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterTickets = () => {
    let filtered = tickets

    if (searchQuery) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.priority === priorityFilter)
    }

    setFilteredTickets(filtered)
  }

  const handleUpdateTicket = async (ticketId: string, updates: any) => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error("Erreur lors de la mise à jour")

      toast({
        title: "Succès",
        description: "Ticket mis à jour avec succès.",
      })

      fetchTickets()
      setSelectedTicket(null)
      setResponse("")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du ticket.",
        variant: "destructive",
      })
    }
  }

  const handleSendResponse = () => {
    if (!selectedTicket || !response.trim()) return

    handleUpdateTicket(selectedTicket.id, {
      response: response.trim(),
      status: "resolved",
    })
  }

  const getStatusInfo = (status: string) => statusConfig[status as keyof typeof statusConfig] || statusConfig.open
  const getPriorityInfo = (priority: string) =>
    priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Support client</h1>
          <p className="text-muted-foreground">Gérez les demandes de support de vos clients</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total tickets</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ouverts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter((t) => t.status === "open").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter((t) => t.status === "in_progress").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolus</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter((t) => t.status === "resolved").length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par sujet, nom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="open">Ouvert</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="resolved">Résolu</SelectItem>
                <SelectItem value="closed">Fermé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrer par priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les priorités</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Élevée</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets de support ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun ticket trouvé.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => {
                  const statusInfo = getStatusInfo(ticket.status)
                  const priorityInfo = getPriorityInfo(ticket.priority)

                  return (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ticket.customerName}</p>
                          <p className="text-sm text-muted-foreground">{ticket.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{ticket.subject}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{ticket.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${priorityInfo.color} text-white`}>{priorityInfo.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusInfo.color} text-white`}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedTicket(ticket)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Voir
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Ticket #{ticket.id.slice(-8)}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium">Client</p>
                                  <p className="text-sm text-muted-foreground">{ticket.customerName}</p>
                                  <p className="text-sm text-muted-foreground">{ticket.customerEmail}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Date de création</p>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(ticket.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm font-medium mb-2">Sujet</p>
                                <p className="text-sm">{ticket.subject}</p>
                              </div>

                              <div>
                                <p className="text-sm font-medium mb-2">Message</p>
                                <div className="bg-muted p-3 rounded-lg">
                                  <p className="text-sm whitespace-pre-wrap">{ticket.message}</p>
                                </div>
                              </div>

                              {ticket.response && (
                                <div>
                                  <p className="text-sm font-medium mb-2">Réponse</p>
                                  <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                                    <p className="text-sm whitespace-pre-wrap">{ticket.response}</p>
                                  </div>
                                </div>
                              )}

                              {ticket.status !== "resolved" && ticket.status !== "closed" && (
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-sm font-medium mb-2">Répondre au client</p>
                                    <Textarea
                                      value={response}
                                      onChange={(e) => setResponse(e.target.value)}
                                      placeholder="Tapez votre réponse..."
                                      className="min-h-[100px]"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button onClick={handleSendResponse} disabled={!response.trim()} className="flex-1">
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Envoyer et marquer comme résolu
                                    </Button>
                                    <Select
                                      value={ticket.status}
                                      onValueChange={(value) => handleUpdateTicket(ticket.id, { status: value })}
                                    >
                                      <SelectTrigger className="w-48">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="open">Ouvert</SelectItem>
                                        <SelectItem value="in_progress">En cours</SelectItem>
                                        <SelectItem value="resolved">Résolu</SelectItem>
                                        <SelectItem value="closed">Fermé</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
