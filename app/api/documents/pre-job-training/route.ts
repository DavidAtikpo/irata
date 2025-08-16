import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import { join } from 'path';

const DATA_PATH = join(process.cwd(), 'data');
const FILE_PATH = join(DATA_PATH, 'pre-job-training-submissions.json');

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
    await ensureDataFile();

    const raw = await fs.readFile(FILE_PATH, 'utf8');
    const list = JSON.parse(raw || '[]');

    const entry = {
      id: Date.now().toString(),
      data,
      createdAt: new Date().toISOString(),
    };

    list.unshift(entry);
    await fs.writeFile(FILE_PATH, JSON.stringify(list, null, 2), 'utf8');

    return NextResponse.json({ message: 'Submitted', entry }, { status: 200 });
  } catch (error) {
    console.error('Error saving pre-job training submission:', error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
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
    console.error('Error reading pre-job training submissions:', error);
    return NextResponse.json({ message: 'Error' }, { status: 500 });
  }
}


