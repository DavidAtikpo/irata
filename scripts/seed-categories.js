const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // Vérifier si des catégories existent déjà
    const existingCategories = await prisma.category.findMany()
    
    if (existingCategories.length > 0) {
      console.log('Des catégories existent déjà:', existingCategories.length)
      return
    }

    // Créer les catégories de base
    const categories = [
      {
        name: 'Harnais',
        description: 'Harnais de sécurité pour travaux en hauteur',
        slug: 'harnais'
      },
      {
        name: 'Cordes',
        description: 'Cordes et accessoires de cordage',
        slug: 'cordes'
      },
      {
        name: 'Casques',
        description: 'Casques de sécurité et protection',
        slug: 'casques'
      },
      {
        name: 'Accessoires',
        description: 'Accessoires et équipements divers',
        slug: 'accessoires'
      }
    ]

    // Insérer les catégories
    const result = await prisma.category.createMany({
      data: categories
    })

    console.log(`${result.count} catégories créées avec succès`)
    
    // Afficher les catégories créées
    const createdCategories = await prisma.category.findMany()
    console.log('Catégories disponibles:', createdCategories.map(c => ({ id: c.id, name: c.name })))
    
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()


