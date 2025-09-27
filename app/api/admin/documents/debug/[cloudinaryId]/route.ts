import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import cloudinary from 'lib/cloudinary';

export async function GET(req: NextRequest, { params }: { params: Promise<{ cloudinaryId: string }> }) {
  try {
    const { cloudinaryId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session?.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Non autorisé - Admin requis' },
        { status: 401 }
      );
    }

    console.log('Diagnostic pour:', cloudinaryId);

    const diagnostics: any = {
      cloudinaryId,
      tests: []
    };

    // Test 1: API Admin Cloudinary - raw
    try {
      const resourceRaw = await cloudinary.api.resource(cloudinaryId, {
        resource_type: 'raw',
        type: 'upload'
      });
      diagnostics.tests.push({
        method: 'API Admin - raw',
        success: true,
        url: resourceRaw.secure_url,
        details: {
          public_id: resourceRaw.public_id,
          format: resourceRaw.format,
          bytes: resourceRaw.bytes,
          created_at: resourceRaw.created_at
        }
      });
    } catch (error: any) {
      diagnostics.tests.push({
        method: 'API Admin - raw',
        success: false,
        error: error.message
      });
    }

    // Test 2: API Admin Cloudinary - image
    try {
      const resourceImage = await cloudinary.api.resource(cloudinaryId.replace('.pdf', ''), {
        resource_type: 'image',
        type: 'upload'
      });
      diagnostics.tests.push({
        method: 'API Admin - image',
        success: true,
        url: resourceImage.secure_url,
        details: {
          public_id: resourceImage.public_id,
          format: resourceImage.format,
          bytes: resourceImage.bytes,
          created_at: resourceImage.created_at
        }
      });
    } catch (error: any) {
      diagnostics.tests.push({
        method: 'API Admin - image',
        success: false,
        error: error.message
      });
    }

    // Test 3: URL Generator - raw
    try {
      const urlRaw = cloudinary.url(cloudinaryId, {
        resource_type: 'raw',
        type: 'upload',
        secure: true
      });
      diagnostics.tests.push({
        method: 'URL Generator - raw',
        success: true,
        url: urlRaw
      });
    } catch (error: any) {
      diagnostics.tests.push({
        method: 'URL Generator - raw',
        success: false,
        error: error.message
      });
    }

    // Test 4: URL Generator - image
    try {
      const urlImage = cloudinary.url(cloudinaryId.replace('.pdf', ''), {
        resource_type: 'image',
        type: 'upload',
        secure: true,
        format: 'pdf'
      });
      diagnostics.tests.push({
        method: 'URL Generator - image',
        success: true,
        url: urlImage
      });
    } catch (error: any) {
      diagnostics.tests.push({
        method: 'URL Generator - image',
        success: false,
        error: error.message
      });
    }

    // Test 5: Fetch test pour chaque URL générée
    for (const test of diagnostics.tests) {
      if (test.url) {
        try {
          const response = await fetch(test.url, { method: 'HEAD' });
          test.fetchTest = {
            status: response.status,
            accessible: response.ok,
            headers: Object.fromEntries(response.headers.entries())
          };
        } catch (fetchError: any) {
          test.fetchTest = {
            error: fetchError.message,
            accessible: false
          };
        }
      }
    }

    return NextResponse.json(diagnostics, { status: 200 });

  } catch (error: any) {
    console.error('Erreur diagnostic:', error);
    return NextResponse.json(
      { 
        message: 'Erreur lors du diagnostic',
        error: error.message 
      },
      { status: 500 }
    );
  }
} 