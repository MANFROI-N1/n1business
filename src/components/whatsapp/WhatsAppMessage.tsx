import React from "react";

interface WhatsAppMessageProps {
  content: string;
  className?: string;
}

// Função para formatar texto com negrito do WhatsApp
export const formatWhatsAppText = (text: string) => {
  // Substituir padrões de negrito do WhatsApp (*texto*) com spans estilizados
  let formattedText = text.replace(/\*(.*?)\*/g, '<span class="font-bold">$1</span>');
  
  // Preservar quebras de linha
  formattedText = formattedText.replace(/\n/g, '<br />');
  
  return formattedText;
};

export function WhatsAppMessage({
  content,
  className = ""
}: WhatsAppMessageProps) {
  return (
    <div 
      className={`text-center ${className}`}
      dangerouslySetInnerHTML={{ __html: formatWhatsAppText(content) }}
    ></div>
  );
}
