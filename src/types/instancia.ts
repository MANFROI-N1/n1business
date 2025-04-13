export interface GupTpData {
  id: number;
  NomeAppGup: string;
  Instancia: string;
  Day: string;
  Periodo: string;
  Quantidade: string;
  token: string;
  statusTp: string;
  textTp?: string;   // Template 1
  textTp1?: string;  // Template 2
  textTp2?: string;  // Template 3
  idconjunto?: string; // Identificador único do conjunto de templates
  DataConjunto?: string;
};

export interface NewInstanceFormData {
  nome: string;
  instancia: string;
  day: string;
  periodo: string;
  quantidade: string;
  token: string;
  status: string;
};

export interface WhatsAppTemplateData {
  textTp: string;   // Template 1
  textTp1: string;  // Template 2
  textTp2: string;  // Template 3
  idconjunto: string; // Identificador único do conjunto de templates
  DataConjunto?: string;
};
