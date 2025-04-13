import { sendTemplateWebhook } from './hooks/instancias/supabase-operations';
import fetch from 'node-fetch';

// Mock do localStorage para ambiente Node.js
const mockStorage: Record<string, string> = {};

// Função para simular o localStorage em ambiente Node
global.localStorage = {
  getItem: (key: string): string | null => {
    return mockStorage[key] || null;
  },
  setItem: (key: string, value: string): void => {
    mockStorage[key] = value;
  },
  removeItem: (key: string): void => {
    delete mockStorage[key];
  },
  clear: (): void => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  },
  key: (index: number): string | null => {
    return Object.keys(mockStorage)[index] || null;
  },
  length: 0
} as Storage;

// URL do webhook
const webhookUrl = 'https://webhook.n1promotora.com.br/webhook/2eed000d-affb-4aa5-9259-d2038e55c114';

/**
 * Verifica a conectividade com um servidor
 * @param url URL do servidor a ser verificado
 * @returns Promise com o resultado da verificação
 */
async function verificarConectividade(url: string): Promise<{
  sucesso: boolean;
  mensagem: string;
  statusCode?: number;
}> {
  try {
    console.log(`Verificando conectividade com ${url}...`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { 
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    return {
      sucesso: response.ok,
      mensagem: `${response.status} ${response.statusText}`,
      statusCode: response.status
    };
  } catch (error: any) {
    console.error(`Erro ao verificar conectividade: ${error.message}`);
    return {
      sucesso: false,
      mensagem: `Erro: ${error.message}`
    };
  }
}

/**
 * Função principal para diagnosticar problemas com o webhook
 */
async function diagnosticarWebhook() {
  console.log('=== DIAGNÓSTICO AVANÇADO DE WEBHOOK INICIADO ===');
  console.log(`Data e hora: ${new Date().toLocaleString()}`);
  
  const idTeste = `test-${Date.now()}`;
  const dataAtual = new Date().toLocaleDateString('pt-BR');
  
  // Dados de teste para o webhook
  const dadosTeste = {
    template: "ativar",
    idconjunto: idTeste,
    nome: 'Teste de Diagnóstico',
    data: dataAtual,
    id: idTeste
  };
  
  console.log('\nVerificando conectividade com o servidor webhook...');
  const resultadoConectividade = await verificarConectividade(webhookUrl);
  
  if (!resultadoConectividade.sucesso) {
    console.log(`   ❌ ${resultadoConectividade.mensagem}`);
  } else {
    console.log(`   ✅ Conectividade OK (${resultadoConectividade.mensagem})`);
  }
  
  // Verificar webhooks pendentes no localStorage simulado
  try {
    const pendingWebhooks = localStorage.getItem('pendingWebhooks');
    if (pendingWebhooks) {
      console.log(`   ⚠️ Existem webhooks pendentes: ${pendingWebhooks}`);
    } else {
      console.log('   ✅ Não há webhooks pendentes');
    }
  } catch (error) {
    console.log(`   ❌ Erro ao verificar webhooks pendentes: ${error}`);
  }
  
  console.log('\nTentando enviar webhook de teste...');
  console.log(JSON.stringify(dadosTeste, null, 2));
  
  const inicioEnvio = Date.now();
  let resultadoEnvio = false;
  
  try {
    // Tentar enviar diretamente para o endpoint
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Webhook-Diagnostics/1.0'
      },
      body: JSON.stringify(dadosTeste)
    });
    
    const tempoEnvio = Date.now() - inicioEnvio;
    
    if (response.ok) {
      console.log(`   ✅ Webhook enviado com sucesso! Tempo de envio: ${tempoEnvio}ms`);
      resultadoEnvio = true;
      
      // Tentar obter a resposta
      try {
        const responseText = await response.text();
        console.log(`   Resposta do servidor: ${responseText}`);
      } catch (e) {
        console.log(`   Não foi possível ler a resposta do servidor: ${e.message}`);
      }
    } else {
      console.log(`   ❌ Falha ao enviar webhook. Status: ${response.status}. Tempo de envio: ${tempoEnvio}ms`);
      
      // Tentar obter detalhes do erro
      try {
        const errorText = await response.text();
        console.log(`   Detalhes do erro: ${errorText}`);
      } catch (e) {
        console.log(`   Não foi possível ler detalhes do erro: ${e.message}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Erro ao enviar webhook: ${error}`);
  }
  
  console.log('\n=== RESULTADO DO TESTE ===');
  console.log(`Status: ${resultadoEnvio ? '✅ SUCESSO' : '❌ FALHA'}`);
  console.log(`URL do webhook: ${webhookUrl}`);
  
  if (!resultadoEnvio) {
    console.log('\n⚠️ SUGESTÕES DE SOLUÇÃO:');
    console.log('1. Verifique se o servidor webhook está online e acessível');
    console.log('2. Confirme se a URL do webhook está correta');
    console.log('3. Verifique se há restrições de firewall ou CORS');
    console.log('4. Tente acessar a URL do webhook diretamente no navegador para verificar se responde');
    console.log('5. Consulte os logs do servidor para verificar se a requisição está chegando');
    console.log('6. Verifique se o formato dos dados está correto conforme esperado pelo servidor');
    console.log('7. Considere implementar um proxy no servidor para contornar restrições de CORS');
    console.log('8. Verifique se o servidor aceita requisições POST do cliente web');
  }
  
  console.log('\n=== DIAGNÓSTICO DE WEBHOOK CONCLUÍDO ===');
  
  return {
    timestamp: new Date().toISOString(),
    idconjunto: idTeste,
    diagnosticoCompleto: true
  };
}

// Executar o diagnóstico e exibir o resultado
diagnosticarWebhook()
  .then(resultado => {
    console.log('Resultado do diagnóstico:', resultado);
    console.log('\nSe o webhook continuar falhando, considere verificar os logs do servidor ou implementar um proxy CORS.');
  })
  .catch(erro => {
    console.error('Erro durante o diagnóstico:', erro);
  });
