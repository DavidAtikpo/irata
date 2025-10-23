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
      console.log('🔗 URL:', resource.secure_url);

      // Retourner les métadonnées du PDF avec l'URL secure_url directe
      return NextResponse.json({
        id: pdfId,
        url: resource.secure_url, // Utiliser secure_url directement
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
