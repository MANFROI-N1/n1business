-- Tabela única para armazenar todas as informações do IA Agente
CREATE TABLE public."IAAgente" (
  id bigint generated by default as identity not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  user_id text not null,
  conversation_id text not null, -- UUID para agrupar mensagens da mesma conversa
  agent_type text not null, -- 'Templates', 'Campanhas', 'Eventos', 'Relatorios'
  content text not null, -- conteúdo da mensagem
  sender text not null, -- 'user', 'agent'
  status text not null default 'sent', -- 'sending', 'sent', 'error'
  attachments jsonb null, -- array de URLs ou metadados de anexos
  metadata jsonb null, -- dados adicionais como tokens, modelo usado, etc.
  constraint IAAgente_pkey primary key (id)
) TABLESPACE pg_default;

-- Criar índices para melhorar a performance
CREATE INDEX idx_ia_agente_user_id ON public."IAAgente" (user_id);
CREATE INDEX idx_ia_agente_conversation_id ON public."IAAgente" (conversation_id);
CREATE INDEX idx_ia_agente_agent_type ON public."IAAgente" (agent_type);
CREATE INDEX idx_ia_agente_created_at ON public."IAAgente" (created_at);

-- Criar políticas de segurança RLS (Row Level Security)
ALTER TABLE public."IAAgente" ENABLE ROW LEVEL SECURITY;

-- Política para visualização
CREATE POLICY "Usuários podem ver apenas suas próprias mensagens"
  ON public."IAAgente"
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Política para inserção
CREATE POLICY "Usuários podem inserir suas próprias mensagens"
  ON public."IAAgente"
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Política para atualização
CREATE POLICY "Usuários podem atualizar apenas suas próprias mensagens"
  ON public."IAAgente"
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Inserir algumas mensagens de exemplo
INSERT INTO public."IAAgente" 
  (user_id, conversation_id, agent_type, content, sender, metadata)
VALUES
  (
    'system', -- substituir pelo ID do usuário real
    '550e8400-e29b-41d4-a716-446655440000', -- UUID de exemplo
    'Templates',
    'Olá! Sou o assistente de Templates. Como posso ajudar você a criar ou gerenciar seus templates de WhatsApp?',
    'agent',
    '{"model": "gpt-3.5-turbo", "system_prompt": "Você é um assistente especializado em ajudar a criar e gerenciar templates de WhatsApp para marketing."}'
  ),
  (
    'system', -- substituir pelo ID do usuário real
    '550e8400-e29b-41d4-a716-446655440001', -- UUID de exemplo
    'Campanhas',
    'Olá! Sou o assistente de Campanhas. Posso ajudar você a planejar, criar ou analisar suas campanhas de marketing.',
    'agent',
    '{"model": "gpt-3.5-turbo", "system_prompt": "Você é um assistente especializado em campanhas de marketing por WhatsApp."}'
  ),
  (
    'system', -- substituir pelo ID do usuário real
    '550e8400-e29b-41d4-a716-446655440002', -- UUID de exemplo
    'Eventos',
    'Olá! Sou o assistente de Eventos. Estou aqui para ajudar com o agendamento e gerenciamento de seus eventos.',
    'agent',
    '{"model": "gpt-3.5-turbo", "system_prompt": "Você é um assistente especializado em gerenciamento de eventos e agendamentos via WhatsApp."}'
  ),
  (
    'system', -- substituir pelo ID do usuário real
    '550e8400-e29b-41d4-a716-446655440003', -- UUID de exemplo
    'Relatorios',
    'Olá! Sou o assistente de Relatórios. Posso ajudar você a gerar e analisar relatórios de desempenho.',
    'agent',
    '{"model": "gpt-3.5-turbo", "system_prompt": "Você é um assistente especializado em análise de dados e relatórios de marketing por WhatsApp."}'
  );
