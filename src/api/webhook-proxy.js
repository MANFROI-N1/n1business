// Simples proxy para webhook que envia apenas a string "ativar"

export default async function handler(req, res) {
  console.log('Requisição recebida no webhook-proxy:', {
    method: req.method,
    headers: req.headers,
    body: req.body
  });

  // URL do webhook de destino - substitua pela sua URL real
  const WEBHOOK_URL = 'https://webhook.n1promotora.com.br/webhook/2eed000d-affb-4aa5-9259-d2038e55c114';
  
  try {
    console.log('Recebida requisição para webhook-proxy');
    
    // Verificar método HTTP
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Método não permitido' });
      return;
    }
    
    // Obter o corpo da requisição (deve ser apenas "ativar")
    const body = req.body;
    console.log('Corpo recebido:', body);
    
    // Validar o corpo
    if (body !== 'ativar') {
      res.status(400).json({ error: 'Corpo inválido - deve ser apenas "ativar"' });
      return;
    }
    
    console.log('Enviando webhook para:', WEBHOOK_URL);
    
    // Enviar para o webhook real
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: 'ativar' // Envia apenas esta string
    });
    
    // Verificar se a requisição foi bem-sucedida
    if (!response.ok) {
      throw new Error(`Erro no webhook: ${response.status} ${response.statusText}`);
    }
    
    console.log('Webhook enviado com sucesso');
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('Erro no proxy do webhook:', error);
    res.status(500).json({ 
      error: 'Erro ao processar webhook',
      details: error.message 
    });
  }
}
