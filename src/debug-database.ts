import { supabase } from "./lib/supabase";
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script de diagnóstico para verificar os dados das tabelas no Supabase
 */
async function debugDatabase() {
  const logLines: string[] = [];
  const log = (message: string) => {
    console.log(message);
    logLines.push(message);
  };

  log("=== DIAGNÓSTICO DE BANCO DE DADOS ===");
  log(`Data e hora: ${new Date().toLocaleString()}`);
  
  try {
    // Verificar a tabela GupTp
    log("\n1. Verificando tabela GupTp...");
    const { data: gupTpData, error: gupTpError } = await supabase
      .from('GupTp')
      .select('*')
      .limit(10);
    
    if (gupTpError) {
      log(`Erro ao buscar dados da tabela GupTp: ${gupTpError.message}`);
    } else {
      log(`Encontrados ${gupTpData?.length || 0} registros na tabela GupTp`);
      if (gupTpData && gupTpData.length > 0) {
        log("Estrutura do primeiro registro:");
        log(JSON.stringify(gupTpData[0], null, 2));
        
        // Verificar se os campos esperados existem
        const firstRecord = gupTpData[0];
        const hasTextTp = 'textTp' in firstRecord;
        const hasTextTp1 = 'textTp1' in firstRecord;
        const hasTextTp2 = 'textTp2' in firstRecord;
        const hasIdConjunto = 'idconjunto' in firstRecord;
        
        log("\nCampos esperados:");
        log(`textTp: ${hasTextTp ? 'Presente ' : 'Ausente '}`);
        log(`textTp1: ${hasTextTp1 ? 'Presente ' : 'Ausente '}`);
        log(`textTp2: ${hasTextTp2 ? 'Presente ' : 'Ausente '}`);
        log(`idconjunto: ${hasIdConjunto ? 'Presente ' : 'Ausente '}`);
        
        // Listar todos os campos do registro
        log("\nTodos os campos do registro:");
        Object.keys(firstRecord).forEach(key => {
          log(`${key}: ${typeof firstRecord[key]} - ${firstRecord[key]}`);
        });
      }
    }
    
    // Verificar a tabela Conjuntos
    log("\n2. Verificando tabela Conjuntos...");
    const { data: conjuntosData, error: conjuntosError } = await supabase
      .from('Conjuntos')
      .select('*')
      .limit(10);
    
    if (conjuntosError) {
      log(`Erro ao buscar dados da tabela Conjuntos: ${conjuntosError.message}`);
    } else {
      log(`Encontrados ${conjuntosData?.length || 0} registros na tabela Conjuntos`);
      if (conjuntosData && conjuntosData.length > 0) {
        log("Estrutura do primeiro registro:");
        log(JSON.stringify(conjuntosData[0], null, 2));
      }
    }
    
    // Verificar a tabela conjuntos_templates (se existir)
    log("\n3. Verificando tabela conjuntos_templates...");
    const { data: conjuntosTemplatesData, error: conjuntosTemplatesError } = await supabase
      .from('conjuntos_templates')
      .select('*')
      .limit(10);
    
    if (conjuntosTemplatesError) {
      log(`Erro ao buscar dados da tabela conjuntos_templates: ${conjuntosTemplatesError.message}`);
      log("Esta tabela pode não existir no banco de dados.");
    } else {
      log(`Encontrados ${conjuntosTemplatesData?.length || 0} registros na tabela conjuntos_templates`);
      if (conjuntosTemplatesData && conjuntosTemplatesData.length > 0) {
        log("Estrutura do primeiro registro:");
        log(JSON.stringify(conjuntosTemplatesData[0], null, 2));
      }
    }
    
  } catch (error) {
    log(`Erro durante o diagnóstico: ${error}`);
  }
  
  log("\n=== DIAGNÓSTICO CONCLUÍDO ===");
  
  // Salvar o log em um arquivo
  const logFilePath = path.join(process.cwd(), 'database-diagnostic.log');
  fs.writeFileSync(logFilePath, logLines.join('\n'));
  console.log(`\nLog salvo em: ${logFilePath}`);
}

// Executar o diagnóstico
debugDatabase()
  .then(() => {
    console.log("\nDiagnóstico concluído com sucesso!");
  })
  .catch(error => {
    console.error("Erro ao executar diagnóstico:", error);
  });
