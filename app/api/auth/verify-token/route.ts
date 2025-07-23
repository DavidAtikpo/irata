import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, token } = await req.json();

    if (!email || !token) {
      return NextResponse.json({ message: 'Email and code are required.' }, { status: 400 });
    }

    const passwordResetToken = await prisma.passwordResetToken.findUnique({
      where: { email },
    });

    if (!passwordResetToken || passwordResetToken.token !== token) {
      return NextResponse.json({ message: 'Invalid code.' }, { status: 400 });
    }

    if (passwordResetToken.expires < new Date()) {
      return NextResponse.json({ message: 'Code has expired.' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Code is valid.' }, { status: 200 });
  } catch (error) {
    console.error('Verify Token Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
} 