export interface Session {
  value: string;
  label: string;
  annee: string;
  mois: string;
  dates: string;
}

export const SESSIONS: Session[] = [
  // Sessions avec ancien format
  { value: '2025-septembre-01-06', label: '2025 - Septembre (01 au 06)', annee: '2025', mois: 'septembre', dates: '01 au 06' },
  { value: '2025-septembre-08-13', label: '2025 - Septembre (08 au 13)', annee: '2025', mois: 'septembre', dates: '08 au 13' },
  { value: '2025-novembre-03-08', label: '2025 - Novembre (03 au 08)', annee: '2025', mois: 'novembre', dates: '03 au 08' },
  { value: '2025-decembre-15-20', label: '2025 - Décembre (15 au 20)', annee: '2025', mois: 'décembre', dates: '15 au 20' },
  
  // Sessions avec nouveau format (avec numéros de version)
  { value: '10-2025-octobre-06-10', label: '10. 2025 / octobre: du 06 au 10 (Examen 11)', annee: '2025', mois: 'octobre', dates: '06 au 10' },
  { value: '10.2-2025-octobre-20-24', label: '10.2 2025 / octobre: du 20 au 24 (Examen 25)', annee: '2025', mois: 'octobre', dates: '20 au 24' },
  
  // Sessions futures avec nouveau format
  { value: '11-2025-novembre-03-07', label: '11. 2025 / novembre: du 03 au 07 (Examen 08)', annee: '2025', mois: 'novembre', dates: '03 au 07' },
  { value: '12-2025-decembre-01-05', label: '12. 2025 / décembre: du 01 au 05 (Examen 06)', annee: '2025', mois: 'décembre', dates: '01 au 05' },
  { value: '13-2026-janvier-05-09', label: '13. 2026 / janvier: du 05 au 09 (Examen 10)', annee: '2026', mois: 'janvier', dates: '05 au 09' },
];

export function getSessionLabel(value: string): string {
  const session = SESSIONS.find(s => s.value === value);
  return session ? session.label : value;
}

export function getSessionByValue(value: string): Session | undefined {
  return SESSIONS.find(s => s.value === value);
} 