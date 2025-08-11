export interface OsiActivity {
  id?: string;
  data: string;
  obra: string;
  atividade: string;
  osi: string;
  ativacao: string;
  equipe_campo: string;
  equipe_configuracao: string;
  obs: string;
  status?: string;
  user_id?: string;
}

export const OSI_ACTIVITY_COLUMNS = [
  { key: 'data', label: 'DATA', width: '120px' },
  { key: 'obra', label: 'OBRA', width: '120px' },
  { key: 'atividade', label: 'ATIVIDADE', width: '300px' },
  { key: 'osi', label: 'OSI', width: '140px' },
  { key: 'ativacao', label: 'ATIVAÇÃO', width: '160px' },
  { key: 'equipe_campo', label: 'EQUIPE DE CAMPO', width: '200px' },
  { key: 'equipe_configuracao', label: 'EQUIPE DE CONFIGURAÇÃO', width: '200px' },
  { key: 'status', label: 'STATUS', width: '120px' },
  { key: 'obs', label: 'OBS', width: '150px' },
];