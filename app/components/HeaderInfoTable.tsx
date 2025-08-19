'use client';

import Image from 'next/image';

interface HeaderInfoTableProps {
  title: string;
  codeNumberLabel?: string;
  codeNumber: string;
  revisionLabel?: string;
  revision: string;
  creationDateLabel?: string;
  creationDate: string;
  logoSrc?: string;
}

export default function HeaderInfoTable({
  title,
  codeNumberLabel = 'Code Number',
  codeNumber,
  revisionLabel = 'Revision',
  revision,
  creationDateLabel = 'Creation date',
  creationDate,
  logoSrc = '/logo.png',
}: HeaderInfoTableProps) {
  return (
    <div className="mb-4 p-3 bg-white">
      <div className="flex flex-col sm:flex-row items-start">
        <div className="mb-3 sm:mb-0 sm:mr-4 flex-shrink-0">
          <div className="w-16 h-16 bg-gray-200 border border-gray-400 flex items-center justify-center overflow-hidden">
            <Image src={logoSrc} alt="Logo" width={64} height={64} />
          </div>
        </div>
        <div className="flex-1 w-full">
          
          {/* Version mobile - Cards */}
          <div className="block sm:hidden space-y-2">
            <div className="bg-gray-50 rounded border p-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Titre:</span>
                <span className="text-sm text-right">{title}</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded border p-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">{codeNumberLabel}:</span>
                <span className="text-sm">{codeNumber}</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded border p-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">{revisionLabel}:</span>
                <span className="text-sm">{revision}</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded border p-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">{creationDateLabel}:</span>
                <span className="text-sm">{creationDate}</span>
              </div>
            </div>
          </div>

          {/* Version desktop - Tableau */}
          <div className="hidden sm:block">
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="border p-2 font-bold">Titre</td>
                  <td className="border p-2">{title}</td>
                  <td className="border p-2 font-bold">{creationDateLabel}</td>
                  <td className="border p-2">{creationDate}</td>
                </tr>
                <tr>
                  <td className="border p-2 font-bold">{codeNumberLabel}</td>
                  <td className="border p-2">{codeNumber}</td>
                  <td className="border p-2 font-bold">{revisionLabel}</td>
                  <td className="border p-2">{revision}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


