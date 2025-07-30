import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const testUsers = [
  {
    email: 'jean.dupont@example.com',
    password: 'password123',
    nom: 'Dupont',
    prenom: 'Jean',
    role: 'USER'
  },
  {
    email: 'marie.martin@example.com',
    password: 'password123',
    nom: 'Martin',
    prenom: 'Marie',
    role: 'USER'
  },
  {
    email: 'pierre.durand@example.com',
    password: 'password123',
    nom: 'Durand',
    prenom: 'Pierre',
    role: 'USER'
  },
  {
    email: 'sophie.bernard@example.com',
    password: 'password123',
    nom: 'Bernard',
    prenom: 'Sophie',
    role: 'USER'
  },
  {
    email: 'lucas.petit@example.com',
    password: 'password123',
    nom: 'Petit',
    prenom: 'Lucas',
    role: 'USER'
  },
  {
    email: 'emma.roux@example.com',
    password: 'password123',
    nom: 'Roux',
    prenom: 'Emma',
    role: 'USER'
  },
  {
    email: 'thomas.moreau@example.com',
    password: 'password123',
    nom: 'Moreau',
    prenom: 'Thomas',
    role: 'USER'
  },
  {
    email: 'julie.simon@example.com',
    password: 'password123',
    nom: 'Simon',
    prenom: 'Julie',
    role: 'USER'
  }
];

async function main() {
  console.log('👥 Création des utilisateurs de test...');

  try {
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          email: userData.email,
          password: hashedPassword,
          nom: userData.nom,
          prenom: userData.prenom,
          role: userData.role as any
        }
      });

      console.log(`✅ Utilisateur créé: ${user.prenom} ${user.nom} (${user.email})`);
    }

    console.log('🎉 Tous les utilisateurs de test ont été créés !');

  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 