import { sendTemplateWebhook } from './hooks/instancias/supabase-operations';

// Função para testar o webhook
async function testWebhook() {
  console.log('=== TESTE DE WEBHOOK INICIADO ===');
  console.log('Data e hora:', new Date().toLocaleString('pt-BR'));
  
  // Verificar conectividade de rede básica
  try {
    console.log('Verificando conectividade de rede...');
    const connectivityCheck = await fetch('https://www.google.com', { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    console.log(`Conectividade básica: ${connectivityCheck.ok ? 'OK' : 'Falha'}`);
    
    // Verificar conectividade com o servidor webhook
    console.log('Verificando conectividade com o servidor webhook...');
    try {
      const webhookConnectivity = await fetch('https://webhook.n1promotora.com.br', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      console.log(`Conectividade com servidor webhook: ${webhookConnectivity.ok ? 'OK' : 'Falha (código: ' + webhookConnectivity.status + ')'}`);
    } catch (webhookError) {
      console.error('Erro ao verificar conectividade com servidor webhook:', webhookError);
      console.log('ATENÇÃO: Problemas de conectividade com o servidor webhook detectados.');
    }
  } catch (error) {
    console.error('Erro de conectividade básica:', error);
    console.log('ATENÇÃO: Problemas de rede detectados. O webhook pode falhar devido a problemas de conectividade.');
  }
  
  // Dados de teste para o webhook
  const idconjunto = "test-" + Date.now();
  const testData = {
    template: "ativar",
    idconjunto: idconjunto,
    nome: "Template de Teste " + new Date().toLocaleTimeString('pt-BR'),
    data: new Date().toLocaleDateString('pt-BR'),
    id: "test-id-" + Math.floor(Math.random() * 1000)
  };
  
  console.log('Enviando dados de teste para webhook de produção:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('URL do webhook: https://webhook.n1promotora.com.br/webhook/71a88ba2-725e-4d0e-b9da-7c27dfcd0751');
  
  // Tentar enviar o webhook
  try {
    console.time('Tempo de envio');
    const result = await sendTemplateWebhook(testData);
    console.timeEnd('Tempo de envio');
    
    console.log('=== RESULTADO DO TESTE ===');
    console.log(`Status: ${result ? 'SUCESSO ' : 'FALHA '}`);
    
    // Verificar se o webhook foi salvo localmente para sincronização posterior
    try {
      const pendingWebhooks = JSON.parse(localStorage.getItem('pendingWebhooks') || '[]');
      const isPending = pendingWebhooks.some(webhook => webhook.data.idconjunto === idconjunto);
      
      if (isPending) {
        console.log('O webhook foi salvo para sincronização posterior.');
        console.log(`Total de webhooks pendentes: ${pendingWebhooks.length}`);
      }
      
      const sentWebhooks = JSON.parse(localStorage.getItem('sentWebhooks') || '[]');
      const isSent = sentWebhooks.some(webhook => webhook.data.idconjunto === idconjunto);
      
      if (isSent) {
        console.log('O webhook foi registrado como enviado com sucesso.');
      }
    } catch (storageError) {
      console.error('Erro ao verificar webhooks no localStorage:', storageError);
    }
    
    if (!result) {
      console.log('\nSUGESTÕES DE SOLUÇÃO:');
      console.log('1. Verifique se o servidor webhook está online e acessível');
      console.log('2. Confirme se a URL do webhook está correta');
      console.log('3. Verifique se há restrições de firewall ou CORS');
      console.log('4. Tente acessar a URL do webhook diretamente no navegador para verificar se responde');
      console.log('5. Consulte os logs do servidor para verificar se a requisição está chegando');
      console.log('6. Verifique se o formato dos dados está correto conforme esperado pelo servidor');
      console.log('7. Tente executar a sincronização de webhooks pendentes');
    }
  } catch (error) {
    console.error('Erro crítico ao testar webhook:', error);
  }
  
  console.log('=== TESTE DE WEBHOOK CONCLUÍDO ===');
}

// Executar o teste
testWebhook();
