import { sendTemplateWebhook } from './hooks/instancias/supabase-operations';

// Dados de teste para simular um template no formato correto
const testTemplate = {
  template: "ativar", // Campo obrigatório esperado pela função
  idconjunto: 'test-' + Date.now(),
  nome: "Template de Teste", // Campo obrigatório esperado pela função
  data: new Date().toLocaleDateString('pt-BR'),
  id: "test-id-" + Math.floor(Math.random() * 1000) // Campo obrigatório esperado pela função
};

console.log('Iniciando teste de envio de webhook...');
console.log('Dados que serão enviados:');
console.log(JSON.stringify(testTemplate, null, 2));

// Enviar o webhook
sendTemplateWebhook(testTemplate)
  .then(result => {
    console.log('\nResultado do envio:');
    console.log(JSON.stringify(result, null, 2));
  })
  .catch(error => {
    console.error('\nErro ao enviar webhook:');
    console.error(error);
  });
