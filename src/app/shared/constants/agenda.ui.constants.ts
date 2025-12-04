import { CommitmentType } from "../../domain/commitment.model";

export const COLORS_BY_TYPE: Record<CommitmentType, string> = {
  'Reunião': '#3b82f6',
  'Consulta': '#10b981',
  'Lembrete': '#f59e0b',
  'Outro': '#8b5cf6'
};
