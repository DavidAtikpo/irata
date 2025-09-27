import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import UserSignedDocumentsClient from '@/app/(user)/documents/irata-signed/UserSignedDocumentsClient';

export default async function UserSignedDocumentsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          Vous devez être connecté pour voir vos documents.
        </div>
      </div>
    );
  }

  return <UserSignedDocumentsClient userEmail={session.user.email} />;
}