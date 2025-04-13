# Nuvem WhatsApp

Aplicação para gerenciamento de templates e envio de mensagens via WhatsApp.

## Funcionalidades

- Gerenciamento de templates de WhatsApp
- Envio de mensagens em massa
- Integração com webhook para ativação de templates
- Gerenciamento de campanhas
- Upload de planilhas de contatos

## Configuração do Ambiente

### Pré-requisitos

- Node.js 16+
- npm ou yarn
- Conta no Supabase
- Conta na Vercel (para deploy)

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
VITE_SUPABASE_URL=https://xqxmrkedkpdgfvtisnsf.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

## Instalação e Execução Local

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/nuvem-whatsapp.git
cd nuvem-whatsapp
```

2. Instale as dependências:
```bash
npm install
# ou
yarn
```

3. Execute o projeto em modo de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

## Deploy na Vercel

### Método 1: Deploy Automático via GitHub

1. Faça o fork deste repositório para sua conta do GitHub
2. Acesse a [Vercel](https://vercel.com) e faça login
3. Clique em "New Project" e selecione o repositório do fork
4. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`: URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Chave anônima do seu projeto Supabase
5. Clique em "Deploy"

### Método 2: Deploy Manual

1. Instale a CLI da Vercel:
```bash
npm install -g vercel
```

2. Faça login na sua conta Vercel:
```bash
vercel login
```

3. Deploy do projeto:
```bash
vercel
```

4. Para ambiente de produção:
```bash
vercel --prod
```

## Webhook para Templates

A aplicação inclui um webhook para ativação de templates de WhatsApp. O webhook envia dados para a URL:
`https://webhook.n1promotora.com.br/webhook/71a88ba2-725e-4d0e-b9da-7c27dfcd0751`

### Formato dos Dados

O webhook envia os seguintes dados:
```json
{
  "template": "ativar",
  "idconjunto": "uuid-do-conjunto",
  "nome": "Nome do Conjunto de Templates",
  "data": "DD/MM/AAAA",
  "id": "id-do-registro"
}
```

### Testando o Webhook

Para testar o webhook, execute:
```bash
npm run test:webhook
# ou
yarn test:webhook
```

## Estrutura do Banco de Dados

### Tabela GupTp

A tabela principal para armazenamento de templates com os seguintes campos importantes:
- `textTp`: Template 1
- `textTp1`: Template 2
- `textTp2`: Template 3
- `idconjunto`: Identificador único do conjunto de templates
- `DataConjunto`: Data de criação do conjunto

## Suporte

Para suporte, entre em contato com a equipe de desenvolvimento.

## Licença

Este projeto está licenciado sob a licença MIT.
