import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files: any[] = [];
    
    // Collecter tous les fichiers
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_') && typeof value === 'object' && value !== null && 'name' in value && 'arrayBuffer' in value) {
        files.push(value as any);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Convertir le buffer en base64 pour Cloudinary
      const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;
      
      try {
        // Upload vers Cloudinary
        const result = await cloudinary.uploader.upload(base64String, {
          folder: 'non-conformites',
          resource_type: 'auto', // Détection automatique du type (image, pdf, etc.)
          public_id: `nc_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
        });
        
        uploadedUrls.push(result.secure_url);
      } catch (cloudinaryError) {
        console.error('Erreur Cloudinary:', cloudinaryError);
        // En cas d'erreur Cloudinary, on continue avec les autres fichiers
        continue;
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: 'Aucun fichier n\'a pu être uploadé' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      urls: uploadedUrls,
      message: `${uploadedUrls.length} fichier(s) uploadé(s) avec succès`
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload des fichiers' }, 
      { status: 500 }
    );
  }
}
