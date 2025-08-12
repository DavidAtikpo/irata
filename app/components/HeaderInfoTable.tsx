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
    <div className="mb-4 p-3 bg-white border rounded shadow">
      <div className="flex items-start">
        <div className="mr-4 flex-shrink-0">
          <div className="w-16 h-16 bg-gray-200 border border-gray-400 flex items-center justify-center overflow-hidden">
            <Image src={logoSrc} alt="Logo" width={64} height={64} />
          </div>
        </div>
        <div className="flex-1">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                <td className="border p-2 font-bold">Titre</td>
                <td className="border p-2 font-bold">{codeNumberLabel}</td>
                <td className="border p-2 font-bold">{revisionLabel}</td>
                <td className="border p-2 font-bold">{creationDateLabel}</td>
              </tr>
              <tr>
                <td className="border p-2">{title}</td>
                <td className="border p-2">{codeNumber}</td>
                <td className="border p-2">{revision}</td>
                <td className="border p-2">{creationDate}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


