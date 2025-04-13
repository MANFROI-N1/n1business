import { supabase } from "./lib/supabase";
import * as fs from 'fs';
import * as path from 'path';

async function checkGupTpTable() {
  const output: string[] = [];
  
  function log(message: string) {
    output.push(message);
  }
  
  log("=== VERIFICAÇÃO DA TABELA GupTp ===");
  log(`Data e hora: ${new Date().toLocaleString()}`);
  log("");
  
  try {
    // Buscar dados da tabela GupTp
    const { data, error } = await supabase
      .from('GupTp')
      .select('*')
      .limit(10);
    
    if (error) {
      log(`ERRO: ${error.message}`);
      return;
    }
    
    log(`Encontrados ${data?.length || 0} registros na tabela GupTp`);
    log("");
    
    if (data && data.length > 0) {
      // Mostrar todos os registros
      data.forEach((record, index) => {
        log(`=== REGISTRO ${index + 1} ===`);
        log(`ID: ${record.id}`);
        log(`NomeAppGup: ${record.NomeAppGup || 'N/A'}`);
        log(`idconjunto: ${record.idconjunto || 'N/A'}`);
        log(`DataConjunto: ${record.DataConjunto || 'N/A'}`);
        log(`statusTp: ${record.statusTp || 'N/A'}`);
        log(`Template 1 (textTp): ${record.textTp ? 'Presente' : 'Ausente'}`);
        log(`Template 2 (textTp1): ${record.textTp1 ? 'Presente' : 'Ausente'}`);
        log(`Template 3 (textTp2): ${record.textTp2 ? 'Presente' : 'Ausente'}`);
        
        // Mostrar conteúdo dos templates
        if (record.textTp) {
          log(`\nConteúdo do Template 1:`);
          log(`${record.textTp}`);
        }
        
        if (record.textTp1) {
          log(`\nConteúdo do Template 2:`);
          log(`${record.textTp1}`);
        }
        
        if (record.textTp2) {
          log(`\nConteúdo do Template 3:`);
          log(`${record.textTp2}`);
        }
        
        log("\n");
      });
      
      // Verificar se os campos necessários existem em todos os registros
      log("=== VERIFICAÇÃO DE CAMPOS ===");
      const missingFields: Record<string, number> = {
        textTp: 0,
        textTp1: 0,
        textTp2: 0,
        idconjunto: 0
      };
      
      data.forEach(record => {
        if (!record.textTp) missingFields.textTp++;
        if (!record.textTp1) missingFields.textTp1++;
        if (!record.textTp2) missingFields.textTp2++;
        if (!record.idconjunto) missingFields.idconjunto++;
      });
      
      log(`Registros sem textTp: ${missingFields.textTp} de ${data.length}`);
      log(`Registros sem textTp1: ${missingFields.textTp1} de ${data.length}`);
      log(`Registros sem textTp2: ${missingFields.textTp2} de ${data.length}`);
      log(`Registros sem idconjunto: ${missingFields.idconjunto} de ${data.length}`);
    }
  } catch (error) {
    log(`ERRO CRÍTICO: ${error}`);
  }
  
  log("\n=== VERIFICAÇÃO CONCLUÍDA ===");
  
  // Salvar a saída em um arquivo
  const logFilePath = path.join(process.cwd(), 'guptp-check.log');
  fs.writeFileSync(logFilePath, output.join('\n'));
  
  console.log(`Verificação concluída. Resultados salvos em: ${logFilePath}`);
}

// Executar a verificação
checkGupTpTable()
  .then(() => {
    console.log("Processo finalizado com sucesso");
  })
  .catch(error => {
    console.error("Erro durante a execução:", error);
  });
