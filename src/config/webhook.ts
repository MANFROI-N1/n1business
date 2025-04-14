// Configurações para webhooks externos
export const webhookConfig = {
  // URL do webhook de teste do n8n
  n8nWebhookUrl: "https://n8nmcp.n1promotora.com.br/webhook-test/7d6ad543-2427-4bd7-bb77-d1ae623e9fff",
  
  // Função para obter a URL do webhook
  getWebhookUrl: () => {
    return webhookConfig.n8nWebhookUrl;
  }
};
