import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data');
const FILE_PATH = join(DATA_PATH, 'irata-disclaimer-submissions.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_PATH, { recursive: true });
    try {
      await fs.access(FILE_PATH);
    } catch {
      await fs.writeFile(FILE_PATH, JSON.stringify([]), 'utf8');
    }
  } catch (err) {
    console.error('Error ensuring data file:', err);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Received disclaimer form data:', data);

    await ensureDataFile();

    const raw = await fs.readFile(FILE_PATH, 'utf8');
    const list = JSON.parse(raw || '[]');

    const entry = {
      id: Date.now().toString(),
      name: data.name || null,
      address: data.address || null,
      signature: data.signature || null,
      session: data.session || null,
      user: data.user || null,
      createdAt: new Date().toISOString(),
      adminSignature: null,
      adminSignedAt: null,
      status: 'pending' as const
    };

    list.unshift(entry);
    await fs.writeFile(FILE_PATH, JSON.stringify(list, null, 2), 'utf8');

    return NextResponse.json({ message: 'Document submitted successfully!', entry }, { status: 200 });
  } catch (error) {
    console.error('Error processing disclaimer form submission:', error);
    return NextResponse.json({ message: 'Error submitting document.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session as any).user?.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    await ensureDataFile();
    const raw = await fs.readFile(FILE_PATH, 'utf8');
    const list = JSON.parse(raw || '[]');

    return NextResponse.json({ submissions: list }, { status: 200 });
  } catch (error) {
    console.error('Error reading submissions:', error);
    return NextResponse.json({ message: 'Erreur lors de la récupération' }, { status: 500 });
  }
}
