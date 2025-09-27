"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Percent, Gift, Calendar, Target } from "lucide-react"

interface Promotion {
  id: string
  name: string
  description: string
  type: "percentage" | "fixed" | "buy_x_get_y"
  value: number
  minOrderAmount: number | null
  maxDiscount: number | null
  startDate: string
  endDate: string
  isActive: boolean
  usageLimit: number | null
  usageCount: number
  code: string | null
  createdAt: string
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "percentage" as "percentage" | "fixed" | "buy_x_get_y",
    value: 0,
    minOrderAmount: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    isActive: true,
    usageLimit: "",
    code: "",
  })

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      const response = await fetch("/api/promotions")
      if (response.ok) {
        const data = await response.json()
        setPromotions(data)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les promotions.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const promotionData = {
        ...formData,
        value: Number(formData.value),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : null,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        code: formData.code || null,
      }

      const url = editingPromotion ? `/api/promotions/${editingPromotion.id}` : "/api/promotions"
      const method = editingPromotion ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promotionData),
      })

      if (!response.ok) throw new Error("Erreur lors de la sauvegarde")

      toast({
        title: "Succès",
        description: `Promotion ${editingPromotion ? "modifiée" : "créée"} avec succès.`,
      })

      setIsDialogOpen(false)
      setEditingPromotion(null)
      resetForm()
      fetchPromotions()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde de la promotion.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    setFormData({
      name: promotion.name,
      description: promotion.description,
      type: promotion.type,
      value: promotion.value,
      minOrderAmount: promotion.minOrderAmount?.toString() || "",
      maxDiscount: promotion.maxDiscount?.toString() || "",
      startDate: promotion.startDate.split("T")[0],
      endDate: promotion.endDate.split("T")[0],
      isActive: promotion.isActive,
      usageLimit: promotion.usageLimit?.toString() || "",
      code: promotion.code || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette promotion ?")) return

    try {
      const response = await fetch(`/api/promotions/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Erreur lors de la suppression")

      toast({
        title: "Succès",
        description: "Promotion supprimée avec succès.",
      })
      fetchPromotions()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de la promotion.",
        variant: "destructive",
      })
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/promotions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })

      if (!response.ok) throw new Error("Erreur lors de la mise à jour")

      toast({
        title: "Succès",
        description: `Promotion ${isActive ? "activée" : "désactivée"} avec succès.`,
      })
      fetchPromotions()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour de la promotion.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "percentage",
      value: 0,
      minOrderAmount: "",
      maxDiscount: "",
      startDate: "",
      endDate: "",
      isActive: true,
      usageLimit: "",
      code: "",
    })
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "percentage":
        return "Pourcentage"
      case "fixed":
        return "Montant fixe"
      case "buy_x_get_y":
        return "Achetez X obtenez Y"
      default:
        return type
    }
  }

  const getValueDisplay = (promotion: Promotion) => {
    switch (promotion.type) {
      case "percentage":
        return `${promotion.value}%`
      case "fixed":
        return `${promotion.value}€`
      case "buy_x_get_y":
        return `${promotion.value} gratuit`
      default:
        return promotion.value
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestion des promotions</h1>
          <p className="text-muted-foreground">Créez et gérez vos offres promotionnelles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm()
                setEditingPromotion(null)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPromotion ? "Modifier la promotion" : "Créer une nouvelle promotion"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom de la promotion *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Code promo (optionnel)</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                    placeholder="Ex: NOEL2024"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Décrivez votre promotion..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type de promotion *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Pourcentage de réduction</SelectItem>
                      <SelectItem value="fixed">Montant fixe de réduction</SelectItem>
                      <SelectItem value="buy_x_get_y">Achetez X obtenez Y gratuit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">
                    Valeur * {formData.type === "percentage" ? "(%)" : formData.type === "fixed" ? "(€)" : "(quantité)"}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => handleInputChange("value", e.target.value)}
                    required
                    min="0"
                    step={formData.type === "percentage" ? "1" : "0.01"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minOrderAmount">Montant minimum de commande (€)</Label>
                  <Input
                    id="minOrderAmount"
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => handleInputChange("minOrderAmount", e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="maxDiscount">Réduction maximum (€)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => handleInputChange("maxDiscount", e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Date de début *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Date de fin *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usageLimit">Limite d'utilisation</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => handleInputChange("usageLimit", e.target.value)}
                    min="1"
                    placeholder="Illimité si vide"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive">Promotion active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Sauvegarde..." : editingPromotion ? "Modifier" : "Créer"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total promotions</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promotions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promotions actives</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promotions.filter((p) => p.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisations totales</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promotions.reduce((sum, p) => sum + p.usageCount, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirent bientôt</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                promotions.filter((p) => {
                  const endDate = new Date(p.endDate)
                  const now = new Date()
                  const diffTime = endDate.getTime() - now.getTime()
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                  return diffDays <= 7 && diffDays > 0
                }).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des promotions */}
      <Card>
        <CardHeader>
          <CardTitle>Promotions ({promotions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune promotion créée pour le moment.</p>
              <p className="text-sm">Créez votre première promotion pour attirer plus de clients.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Valeur</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Période</TableHead>
                  <TableHead>Utilisations</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{promotion.name}</p>
                        {promotion.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">{promotion.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getTypeLabel(promotion.type)}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{getValueDisplay(promotion)}</TableCell>
                    <TableCell>
                      {promotion.code ? (
                        <Badge variant="secondary">{promotion.code}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(promotion.startDate).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">au {new Date(promotion.endDate).toLocaleDateString()}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{promotion.usageCount}</p>
                        {promotion.usageLimit && <p className="text-muted-foreground">/ {promotion.usageLimit}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={promotion.isActive}
                          onCheckedChange={(checked) => toggleActive(promotion.id, checked)}
                        />
                        <Badge variant={promotion.isActive ? "default" : "secondary"}>
                          {promotion.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(promotion)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(promotion.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
