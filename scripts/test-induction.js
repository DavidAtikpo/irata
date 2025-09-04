const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testInduction() {
  try {
    console.log('🔍 Test des inductions en base de données...\n');

    // 1. Vérifier toutes les inductions
    console.log('1. Toutes les inductions:');
    const inductions = await prisma.$queryRaw`
      SELECT * FROM "webirata"."TraineeInduction" 
      ORDER BY "createdAt" DESC
    `;
    console.log('Inductions trouvées:', inductions.length);
    inductions.forEach((ind, index) => {
      console.log(`  ${index + 1}. Session: "${ind.sessionId}" | Statut: ${ind.status} | Créée: ${ind.createdAt}`);
    });

    // 2. Vérifier les sessions de formation
    console.log('\n2. Sessions de formation:');
    const sessions = await prisma.$queryRaw`
      SELECT DISTINCT dm.session, dm."createdAt", COUNT(*) as user_count
      FROM "webirata"."Demande" dm
      GROUP BY dm.session, dm."createdAt"
      ORDER BY dm."createdAt" DESC
    `;
    console.log('Sessions trouvées:', sessions.length);
    sessions.forEach((session, index) => {
      console.log(`  ${index + 1}. Session: "${session.session}" | Utilisateurs: ${session.user_count} | Créée: ${session.createdAt}`);
    });

    // 3. Vérifier l'utilisateur spécifique
    console.log('\n3. Utilisateur dubonservice78@gmail.com:');
    const user = await prisma.user.findUnique({
      where: { email: 'dubonservice78@gmail.com' }
    });
    
    if (user) {
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      
      // Vérifier ses demandes
      const userDemandes = await prisma.$queryRaw`
        SELECT dm.session, dm."createdAt"
        FROM "webirata"."Demande" dm
        WHERE dm."userId" = ${user.id}
        ORDER BY dm."createdAt" DESC
      `;
      console.log('  Demandes:', userDemandes);
      
      // Vérifier s'il y a une induction pour sa session
      if (userDemandes.length > 0) {
        const userSession = userDemandes[0].session;
        console.log(`  Session utilisateur: "${userSession}"`);
        
        const userInduction = await prisma.$queryRaw`
          SELECT * FROM "webirata"."TraineeInduction" 
          WHERE "sessionId" = ${userSession}
        `;
        console.log('  Induction pour cette session:', userInduction);
      }
    } else {
      console.log('  Utilisateur non trouvé');
    }

    // 4. Vérifier la correspondance exacte des sessions
    console.log('\n4. Correspondance des sessions:');
    const allSessions = await prisma.$queryRaw`
      SELECT DISTINCT dm.session FROM "webirata"."Demande" dm
    `;
    const allInductions = await prisma.$queryRaw`
      SELECT DISTINCT ti."sessionId" FROM "webirata"."TraineeInduction" ti
    `;
    
    console.log('  Sessions de formation:', allSessions.map(s => s.session));
    console.log('  Sessions avec induction:', allInductions.map(i => i.sessionId));
    
    // Vérifier les correspondances
    allSessions.forEach(session => {
      const hasInduction = allInductions.some(ind => ind.sessionId === session.session);
      console.log(`  Session "${session.session}": ${hasInduction ? '✅ Induction trouvée' : '❌ Pas d\'induction'}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInduction();




