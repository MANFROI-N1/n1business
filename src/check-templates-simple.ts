import { supabase } from "./lib/supabase";

async function checkTemplates() {
  console.log("Verificando templates na tabela GupTp...");
  
  try {
    // Buscar dados da tabela GupTp
    const { data, error } = await supabase
      .from('GupTp')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error("Erro ao buscar dados:", error.message);
      return;
    }
    
    console.log(`Encontrados ${data?.length || 0} registros`);
    
    if (data && data.length > 0) {
      // Mostrar apenas os campos relevantes de cada registro
      data.forEach((record, index) => {
        console.log(`\n--- Template ${index + 1} ---`);
        console.log(`ID: ${record.id}`);
        console.log(`idconjunto: ${record.idconjunto || 'N/A'}`);
        
        // Mostrar apenas se os templates existem ou não
        console.log(`Template 1: ${record.textTp ? 'Presente' : 'Ausente'}`);
        console.log(`Template 2: ${record.textTp1 ? 'Presente' : 'Ausente'}`);
        console.log(`Template 3: ${record.textTp2 ? 'Presente' : 'Ausente'}`);
      });
    }
  } catch (error) {
    console.error("Erro durante a verificação:", error);
  }
}

// Executar a verificação
checkTemplates()
  .then(() => console.log("\nVerificação concluída"))
  .catch(error => console.error("Erro:", error));
