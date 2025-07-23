import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, token, password } = await req.json();

    if (!email || !token || !password) {
      return NextResponse.json({ message: 'Email, code, and password are required.' }, { status: 400 });
    }

    // Verify the token first
    const passwordResetToken = await prisma.passwordResetToken.findUnique({
      where: { email },
    });

    if (!passwordResetToken || passwordResetToken.token !== token) {
      return NextResponse.json({ message: 'Invalid code.' }, { status: 400 });
    }

    if (passwordResetToken.expires < new Date()) {
      return NextResponse.json({ message: 'Code has expired.' }, { status: 400 });
    }

    // Hash the new password and update the user
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete the used token
    await prisma.passwordResetToken.delete({
      where: { email },
    });

    return NextResponse.json({ message: 'Password has been reset successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
} 