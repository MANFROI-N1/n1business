// Este arquivo será usado como uma API serverless na Vercel para contornar problemas de CORS
// Salve este arquivo em /api/webhook-proxy.js

export default async function handler(req, res) {
  // Permitir apenas solicitações POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // URL do webhook de destino
    const webhookUrl = 'https://webhook.n1promotora.com.br/webhook/71a88ba2-725e-4d0e-b9da-7c27dfcd0751';
    
    // Obter os dados do corpo da requisição
    const data = req.body;
    
    console.log('Proxy recebeu dados:', data);
    
    // Enviar a solicitação para o webhook de destino
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Nuvem-WhatsApp-Proxy/1.0'
      },
      body: JSON.stringify(data)
    });
    
    // Obter a resposta como texto
    const responseText = await response.text();
    
    // Retornar a resposta do webhook de destino
    return res.status(response.status).json({
      success: response.ok,
      status: response.status,
      data: responseText,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro no proxy do webhook:', error);
    return res.status(500).json({
      error: 'Erro ao encaminhar a solicitação',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
