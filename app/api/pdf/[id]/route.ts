import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pdfId } = await params;
    
    if (!pdfId) {
      return NextResponse.json({ error: 'ID du PDF requis' }, { status: 400 });
    }

    console.log('🔍 Récupération des données PDF pour ID:', pdfId);

    // Reconstruire le public_id complet (avec le dossier qr-generator/)
    const fullPublicId = `qr-generator/${pdfId}`;
    
    console.log('📋 Public ID complet:', fullPublicId);

    // Vérifier que le fichier existe sur Cloudinary
    try {
      const resource = await cloudinary.api.resource(fullPublicId, {
        resource_type: 'raw', // PDFs sont des raw files, pas des images
        type: 'upload',
      });

      console.log('✅ Fichier trouvé sur Cloudinary:', resource.public_id);
      console.log('📊 Taille:', resource.bytes, 'bytes');
      console.log('📅 Créé le:', resource.created_at);
      console.log('🔗 URL brute:', resource.secure_url);

      // Générer une URL avec flags pour forcer l'affichage inline et ajouter .pdf
      let pdfUrl = resource.secure_url;
      
      // Ajouter .pdf à la fin si ce n'est pas déjà présent
      if (!pdfUrl.endsWith('.pdf')) {
        pdfUrl = `${pdfUrl}.pdf`;
      }
      
      // Ajouter le flag fl_attachment:inline pour forcer l'affichage dans le navigateur
      // au lieu du téléchargement
      pdfUrl = pdfUrl.replace('/upload/', '/upload/fl_attachment:inline/');
      
      console.log('🔗 URL finale avec flags:', pdfUrl);

      // Retourner les métadonnées du PDF avec l'URL modifiée
      return NextResponse.json({
        id: pdfId,
        url: pdfUrl, // URL avec flags pour affichage inline
        title: `Document ${pdfId}`,
        fileSize: resource.bytes,
        uploadedAt: resource.created_at,
        format: resource.format,
        publicId: resource.public_id,
      });

    } catch (cloudinaryError: any) {
      console.error('❌ Fichier non trouvé sur Cloudinary:', cloudinaryError);
      
      if (cloudinaryError.http_code === 404) {
        return NextResponse.json(
          { error: 'Document non trouvé' }, 
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du document' }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Erreur API PDF:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' }, 
      { status: 500 }
    );
  }
}
