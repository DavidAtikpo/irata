'use client';

import React from 'react';

interface ResponsiveTableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export default function ResponsiveTable({ headers, children, className = '' }: ResponsiveTableProps) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((header, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {children}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

interface ResponsiveTableRowProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTableRow({ children, className = '' }: ResponsiveTableRowProps) {
  return (
    <tr className={`hover:bg-gray-50 ${className}`}>
      {children}
    </tr>
  );
}

interface ResponsiveTableCellProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTableCell({ children, className = '' }: ResponsiveTableCellProps) {
  return (
    <td className={`whitespace-nowrap px-3 py-4 text-sm text-gray-900 sm:px-6 ${className}`}>
      {children}
    </td>
  );
} 