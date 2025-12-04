export type CommitmentType = 'Reunião' | 'Consulta' | 'Lembrete' | 'Outro';

export interface Commitment  {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  participants: string[];
  type: CommitmentType;
  color?: string;
}
