export interface Activity {
  id?: string;
  data: string;
  hora: string;
  obra: string;
  site: string;
  otsOsi: string;
  designacao: string;
  equipeConfiguracao: string;
  cidade: string;
  empresa: string;
  equipe: string;
  atividade: string;
  observacao: string;
  status: string;
  statusColor?: string;
  tags?: string[];
  prazo?: string;
}

export interface ActivityStatus {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_STATUSES: ActivityStatus[] = [
  { id: '1', name: 'ATIVO', color: '#16a34a' },
  { id: '2', name: 'INATIVO', color: '#dc2626' },
  { id: '3', name: 'PENDENTE', color: '#eab308' },
  { id: '4', name: 'CONCLUÍDO', color: '#16a34a' },
  { id: '5', name: 'CANCELADO', color: '#dc2626' },
];

export const ACTIVITY_COLUMNS = [
  { key: 'data', label: 'DATA', width: '120px' },
  { key: 'hora', label: 'HORA', width: '100px' },
  { key: 'obra', label: 'OBRA', width: '150px' },
  { key: 'site', label: 'SITE', width: '200px' },
  { key: 'otsOsi', label: 'OTS / OSI', width: '120px' },
  { key: 'designacao', label: 'DESIGNAÇÃO', width: '150px' },
  { key: 'equipeConfiguracao', label: 'EQUIPE CONFIGURAÇÃO', width: '180px' },
  { key: 'cidade', label: 'CIDADE', width: '150px' },
  { key: 'empresa', label: 'EMPRESA', width: '150px' },
  { key: 'equipe', label: 'EQUIPE', width: '150px' },
  { key: 'atividade', label: 'ATIVIDADE', width: '150px' },
  { key: 'observacao', label: 'OBSERVAÇÃO', width: '200px' },
  { key: 'status', label: 'STATUS', width: '120px' },
];