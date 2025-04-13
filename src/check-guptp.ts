import { supabase } from "./lib/supabase";

async function checkGupTpTable() {
  console.log("Verificando tabela GupTp...");
  
  try {
    // Buscar dados da tabela GupTp
    const { data, error } = await supabase
      .from('GupTp')
      .select('*')
      .limit(10);
    
    if (error) {
      console.error("Erro ao buscar dados:", error.message);
      return;
    }
    
    console.log(`Encontrados ${data?.length || 0} registros`);
    
    if (data && data.length > 0) {
      // Mostrar campos do primeiro registro
      const firstRecord = data[0];
      console.log("\nCampos do primeiro registro:");
      
      Object.keys(firstRecord).forEach(key => {
        const value = firstRecord[key];
        const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        console.log(`${key}: ${valueStr}`);
      });
      
      // Verificar campos específicos
      console.log("\nVerificando campos específicos:");
      console.log(`textTp: ${firstRecord.textTp ? 'Presente' : 'Ausente'}`);
      console.log(`textTp1: ${firstRecord.textTp1 ? 'Presente' : 'Ausente'}`);
      console.log(`textTp2: ${firstRecord.textTp2 ? 'Presente' : 'Ausente'}`);
      console.log(`idconjunto: ${firstRecord.idconjunto ? 'Presente' : 'Ausente'}`);
      
      // Mostrar conteúdo dos templates
      console.log("\nConteúdo dos templates:");
      console.log(`Template 1 (textTp): ${firstRecord.textTp || 'Vazio'}`);
      console.log(`Template 2 (textTp1): ${firstRecord.textTp1 || 'Vazio'}`);
      console.log(`Template 3 (textTp2): ${firstRecord.textTp2 || 'Vazio'}`);
    }
  } catch (error) {
    console.error("Erro durante a verificação:", error);
  }
}

// Executar a verificação
checkGupTpTable()
  .then(() => console.log("Verificação concluída"))
  .catch(error => console.error("Erro:", error));
