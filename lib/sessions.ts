export interface Session {
  value: string;
  label: string;
  annee: string;
  mois: string;
  dates: string;
}

export const SESSIONS: Session[] = [
  { value: '2025-fevrier-03-08', label: '2025 - Février (03 au 08)', annee: '2025', mois: 'février', dates: '03 au 08' },
  { value: '2025-avril-31mars-05avril', label: '2025 - Avril (31 mars au 05 avril)', annee: '2025', mois: 'avril', dates: '31 mars au 05 avril' },
  { value: '2025-avril-21-26', label: '2025 - Avril (21 au 26)', annee: '2025', mois: 'avril', dates: '21 au 26' },
  { value: '2025-juin-02-07', label: '2025 - Juin (02 au 07)', annee: '2025', mois: 'juin', dates: '02 au 07' },
  { value: '2025-juillet-30juin-05juillet', label: '2025 - Juillet (30 juin au 05 juillet)', annee: '2025', mois: 'juillet', dates: '30 juin au 05 juillet' },
  { value: '2025-juillet-21-26', label: '2025 - Juillet (21 au 26)', annee: '2025', mois: 'juillet', dates: '21 au 26' },
  { value: '2025-aout-18-23', label: '2025 - Août (18 au 23)', annee: '2025', mois: 'aout', dates: '18 au 23' },
  { value: '2025-septembre-01-06', label: '2025 - Septembre (01 au 06)', annee: '2025', mois: 'septembre', dates: '01 au 06' },
  { value: '2025-septembre-08-13', label: '2025 - Septembre (08 au 13)', annee: '2025', mois: 'septembre', dates: '08 au 13' },
  { value: '2025-octobre-06-11', label: '2025 - Octobre (06 au 11)', annee: '2025', mois: 'octobre', dates: '06 au 11' },
  { value: '2025-novembre-03-08', label: '2025 - Novembre (03 au 08)', annee: '2025', mois: 'novembre', dates: '03 au 08' },
  
  { value: '2025-decembre-15-20', label: '2025 - Décembre (15 au 20)', annee: '2025', mois: 'décembre', dates: '15 au 20' },
];

export function getSessionLabel(value: string): string {
  const session = SESSIONS.find(s => s.value === value);
  return session ? session.label : value;
}

export function getSessionByValue(value: string): Session | undefined {
  return SESSIONS.find(s => s.value === value);
} 