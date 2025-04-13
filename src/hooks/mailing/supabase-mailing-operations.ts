import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

// Estrutura da tabela Global
interface GlobalRow {
  Beneficio?: number;
  CPF: number; // Não pode ser nulo na tabela
  Nome?: string;
  Nome_Mae?: string;
  DDB?: string;
  DIB?: string;
  Valor_Beneficio?: number;
  Data_Nascimento?: string;
  Idade?: number;
  RG?: string;
  Codigo_Especie?: number;
  Meio_Pagamento?: string;
  Banco?: string;
  Agencia?: string;
  Conta?: string;
  Municipio?: string;
  UF?: string;
  Bairro?: string;
  Endereco?: string;
  CEP?: string;
  Margem_Disponivel?: number;
  Emprestimo_Ativos?: number;
  Bloqueado_Emprestimo?: string;
  Margem_RMC?: string;
  Margem_RCC?: string;
  Possui_Representante?: string;
  Nome_Representante?: string;
  CPF_Representante?: string;
  Desconto_Associacao?: string;
  Telefone1?: string;
  Telefone2?: string;
  Telefone3?: string;
  Email1?: string;
  Email2?: string;
  Email3?: string;
  origem?: string;
  [key: string]: any; // Permitir campos adicionais para flexibilidade
}

// Função para processar e salvar um arquivo CSV no Supabase
export async function processMailingFile(
  file: File, 
  onProgress?: (progress: number, totalLines: number, processedLines: number) => void
): Promise<{
  success: boolean;
  recordCount: number;
  totalLines: number;
  mailingId: string;
  error?: string;
}> {
  try {
    console.log("Iniciando processamento do arquivo:", file.name);
    
    // Gerar um ID único para o mailing
    const mailingId = uuidv4();
    const mailingName = file.name.replace(".csv", "");
    
    // Ler o conteúdo do arquivo
    const fileContent = await file.text();
    console.log("Arquivo lido com sucesso, tamanho:", fileContent.length);
    
    // Detectar o separador do CSV (vírgula, ponto e vírgula, etc.)
    let separator = ",";
    if (fileContent.indexOf(";") > -1) {
      separator = ";";
    } else if (fileContent.indexOf("\t") > -1) {
      separator = "\t";
    }
    console.log("Separador detectado:", separator);
    
    // Dividir o conteúdo em linhas
    const lines = fileContent.split(/\r?\n/);
    console.log("Total de linhas no arquivo:", lines.length);
    
    // Calcular o número total de linhas (excluindo o cabeçalho)
    const totalLines = lines.length - 1;
    
    if (totalLines <= 0) {
      throw new Error("Arquivo vazio ou sem dados válidos");
    }
    
    // Extrair cabeçalho
    const header = lines[0].split(separator).map(col => col.trim().replace(/^["']|["']$/g, ''));
    console.log("Cabeçalho do arquivo:", header);
    
    // Identificar colunas importantes
    const columnMappings: { [key: string]: string } = {};
    
    // Mapeamento de nomes de colunas comuns para os campos da tabela Global
    const possibleColumnNames: { [key: string]: string[] } = {
      "Beneficio": ["beneficio", "benefício", "num_beneficio", "número do benefício", "nb"],
      "CPF": ["cpf", "documento", "document", "cpf/cnpj", "cnpj/cpf", "doc"],
      "Nome": ["nome", "name", "cliente", "customer", "nome completo", "full name", "contato", "contact"],
      "Nome_Mae": ["nome_mae", "nome da mãe", "mae", "mãe", "nome mae", "mother"],
      "DDB": ["ddb", "data de despacho", "despacho"],
      "DIB": ["dib", "data de início", "início benefício", "inicio beneficio"],
      "Valor_Beneficio": ["valor_beneficio", "valor do benefício", "valor beneficio", "beneficio valor"],
      "Data_Nascimento": ["data_nascimento", "data de nascimento", "nascimento", "birth", "birthdate"],
      "Idade": ["idade", "age"],
      "RG": ["rg", "registro geral", "identidade"],
      "Codigo_Especie": ["codigo_especie", "código espécie", "especie", "tipo beneficio"],
      "Meio_Pagamento": ["meio_pagamento", "meio de pagamento", "payment"],
      "Banco": ["banco", "bank"],
      "Agencia": ["agencia", "agência", "agency"],
      "Conta": ["conta", "conta bancária", "account"],
      "Municipio": ["municipio", "município", "cidade", "city"],
      "UF": ["uf", "estado", "state"],
      "Bairro": ["bairro", "neighborhood"],
      "Endereco": ["endereco", "endereço", "logradouro", "address"],
      "CEP": ["cep", "código postal", "zip", "zipcode"],
      "Margem_Disponivel": ["margem_disponivel", "margem disponível", "margem", "margin"],
      "Emprestimo_Ativos": ["emprestimo_ativos", "empréstimos ativos", "emprestimos", "loans"],
      "Bloqueado_Emprestimo": ["bloqueado_emprestimo", "bloqueado para empréstimo"],
      "Margem_RMC": ["margem_rmc", "rmc"],
      "Margem_RCC": ["margem_rcc", "rcc"],
      "Possui_Representante": ["possui_representante", "possui representante", "has representative"],
      "Nome_Representante": ["nome_representante", "nome do representante", "representative name"],
      "CPF_Representante": ["cpf_representante", "cpf do representante", "representative document"],
      "Desconto_Associacao": ["desconto_associacao", "desconto associação", "discount"],
      "Telefone1": ["telefone1", "telefone 1", "celular", "telefone", "fone", "tel", "phone", "mobile"],
      "Telefone2": ["telefone2", "telefone 2", "celular2", "phone2"],
      "Telefone3": ["telefone3", "telefone 3", "celular3", "phone3"],
      "Email1": ["email1", "e-mail", "email", "mail"],
      "Email2": ["email2", "email 2", "mail2"],
      "Email3": ["email3", "email 3", "mail3"],
      "origem": ["origem", "source", "origin"]
    };
    
    // Identificar colunas no cabeçalho
    header.forEach((colName, index) => {
      const lowerColName = colName.toLowerCase();
      
      // Verificar cada tipo de coluna possível
      Object.entries(possibleColumnNames).forEach(([fieldName, possibleNames]) => {
        if (possibleNames.some(name => lowerColName.includes(name))) {
          columnMappings[fieldName] = colName;
        }
      });
      
      // Verificar correspondência exata com o nome do campo
      if (Object.keys(possibleColumnNames).includes(colName)) {
        columnMappings[colName] = colName;
      }
    });
    
    console.log("Mapeamento de colunas:", columnMappings);
    
    // Processar os dados
    const processedData: GlobalRow[] = [];
    let recordCount = 0;
    
    // Processar em lotes para melhorar o desempenho e atualizar o progresso
    const batchSize = 100;
    const batches = Math.ceil(totalLines / batchSize);
    
    console.log(`Processando ${batches} lotes de ${batchSize} linhas cada`);
    
    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const startIndex = batchIndex * batchSize + 1; // +1 para pular o cabeçalho
      const endIndex = Math.min(startIndex + batchSize, lines.length);
      
      console.log(`Processando lote ${batchIndex + 1}/${batches}, linhas ${startIndex} até ${endIndex}`);
      
      for (let i = startIndex; i < endIndex; i++) {
        if (!lines[i] || !lines[i].trim()) continue; // Pular linhas vazias
        
        // Dividir a linha em colunas
        const cols = lines[i].split(separator).map(col => col.trim().replace(/^["']|["']$/g, ''));
        
        // Criar objeto com os dados da linha
        const rowData: GlobalRow = {
          origem: mailingName, // Definir a origem como o nome do arquivo
          CPF: 0 // Valor padrão para CPF (será substituído se encontrado no CSV)
        };
        
        // Preencher os dados com base no mapeamento de colunas
        Object.entries(columnMappings).forEach(([fieldName, headerColName]) => {
          const colIndex = header.indexOf(headerColName);
          if (colIndex >= 0 && colIndex < cols.length) {
            const value = cols[colIndex];
            if (!value) return; // Pular valores vazios
            
            // Converter o valor para o tipo correto com base no campo
            switch (fieldName) {
              case "Beneficio":
              case "Idade":
              case "Codigo_Especie":
              case "Emprestimo_Ativos":
                rowData[fieldName as keyof GlobalRow] = value ? parseInt(value) : undefined;
                break;
                
              case "CPF":
                if (value) {
                  const cleanCpf = value.replace(/\D/g, '');
                  rowData.CPF = cleanCpf ? parseInt(cleanCpf) : undefined;
                }
                break;
                
              case "Valor_Beneficio":
              case "Margem_Disponivel":
                rowData[fieldName as keyof GlobalRow] = value ? parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.')) : undefined;
                break;
                
              case "Telefone1":
              case "Telefone2":
              case "Telefone3":
                rowData[fieldName as keyof GlobalRow] = value ? value.replace(/\D/g, '') : undefined;
                break;
                
              default:
                // Para campos de texto, usar o valor diretamente
                rowData[fieldName as keyof GlobalRow] = value;
            }
          }
        });
        
        // Também adicionar valores diretamente pelo cabeçalho original
        header.forEach((colName, index) => {
          if (index < cols.length) {
            const value = cols[index];
            if (!value) return; // Pular valores vazios
            
            // Adicionar o valor diretamente usando o nome da coluna original
            // Isso garante que todos os dados são importados mesmo que não mapeados
            (rowData as any)[colName] = value;
          }
        });
        
        // Garantir que o CPF está presente (campo obrigatório na tabela)
        if (!rowData.CPF) {
          // Tentar encontrar um CPF em qualquer outro campo
          const allValues = Object.values(rowData).filter(v => typeof v === 'string');
          const possibleCpf = allValues.find(v => /^\d{11}$/.test(v?.toString().replace(/\D/g, '') || ''));
          
          if (possibleCpf) {
            const cleanCpf = possibleCpf.toString().replace(/\D/g, '');
            rowData.CPF = parseInt(cleanCpf);
          } else {
            // Se não encontrar CPF, usar um valor padrão
            rowData.CPF = 0; // CPF não pode ser nulo na tabela
          }
        }
        
        // Garantir que temos pelo menos um nome
        if (!rowData.Nome) {
          rowData.Nome = `Contato ${i}`;
        }
        
        // Sempre adicionar o registro, independentemente dos campos
        processedData.push(rowData);
        recordCount++;
        
        // Log para depuração (apenas para as primeiras linhas)
        if (i < startIndex + 2) {
          console.log(`Linha ${i} processada:`, rowData);
        }
      }
      
      // Calcular o progresso atual
      const processedLines = Math.min((batchIndex + 1) * batchSize, totalLines);
      const progress = Math.round((processedLines / totalLines) * 100);
      
      console.log(`Progresso: ${progress}%, Linhas processadas: ${processedLines}/${totalLines}`);
      
      // Chamar o callback de progresso, se fornecido
      if (onProgress) {
        onProgress(progress, totalLines, processedLines);
      }
    }
    
    console.log(`Processamento concluído. Total de registros válidos: ${recordCount}`);
    
    // Salvar os dados no Supabase
    if (processedData.length > 0) {
      console.log(`Iniciando inserção de ${processedData.length} registros no Supabase`);
      
      // Inserir em lotes menores para evitar problemas com limites de tamanho
      const insertBatchSize = 500;
      const insertBatches = Math.ceil(processedData.length / insertBatchSize);
      
      for (let i = 0; i < insertBatches; i++) {
        const start = i * insertBatchSize;
        const end = Math.min(start + insertBatchSize, processedData.length);
        const batch = processedData.slice(start, end);
        
        console.log(`Inserindo lote ${i + 1}/${insertBatches} (${batch.length} registros)`);
        
        try {
          // Inserir na tabela Global
          const { error: contatosError } = await supabase
            .from("Global")
            .insert(batch);
          
          if (contatosError) {
            console.error("Erro ao inserir lote:", contatosError);
            throw new Error(`Erro ao salvar contatos: ${contatosError.message}`);
          }
          
          console.log(`Lote ${i + 1} inserido com sucesso`);
        } catch (error) {
          console.error(`Erro ao inserir lote ${i + 1}:`, error);
          throw error;
        }
      }
      
      console.log("Todos os registros foram inseridos com sucesso");
    } else {
      console.log("Nenhum registro válido para inserir");
    }
    
    return {
      success: true,
      recordCount,
      totalLines,
      mailingId
    };
  } catch (error: any) {
    console.error("Erro ao processar arquivo de mailing:", error);
    return {
      success: false,
      recordCount: 0,
      totalLines: 0,
      mailingId: "",
      error: error.message
    };
  }
}

// Interface para os resultados da busca de mailings
interface MailingResult {
  origem: string;
  nome: string;
  registros: number;
}

// Função para buscar todos os mailings
export async function fetchMailings(): Promise<{
  success: boolean;
  mailings: MailingResult[];
  error?: string;
}> {
  try {
    // Buscar todos os registros da tabela Global agrupados por origem
    const { data, error } = await supabase
      .from("Global")
      .select("origem, Nome, id")
      .order('origem');
    
    if (error) {
      throw new Error(`Erro ao buscar mailings: ${error.message}`);
    }
    
    // Se não houver dados, retornar array vazio
    if (!data || data.length === 0) {
      return {
        success: true,
        mailings: []
      };
    }
    
    // Usar um Map para agrupar os registros por origem
    const campanhasMap = new Map<string, MailingResult>();
    
    // Processar cada registro
    data.forEach(item => {
      if (!item || typeof item !== 'object') return;
      
      // Verificar se o item tem os campos necessários
      const origem = item.origem;
      if (!origem) return;
      
      if (!campanhasMap.has(origem)) {
        campanhasMap.set(origem, {
          origem,
          nome: origem, // Usar o valor de origem como nome
          registros: 1
        });
      } else {
        const campanha = campanhasMap.get(origem);
        if (campanha) {
          campanha.registros += 1;
        }
      }
    });
    
    // Converter o Map para array
    const mailings = Array.from(campanhasMap.values());
    
    return {
      success: true,
      mailings
    };
  } catch (error: any) {
    console.error("Erro ao buscar mailings:", error);
    return {
      success: false,
      mailings: [],
      error: error.message
    };
  }
}

// Função para buscar os contatos de um mailing específico
export async function fetchMailingContacts(origem: string): Promise<{
  success: boolean;
  contacts: any[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("Global")
      .select("*")
      .eq("origem", origem);
    
    if (error) {
      throw new Error(`Erro ao buscar contatos do mailing: ${error.message}`);
    }
    
    return {
      success: true,
      contacts: data || []
    };
  } catch (error: any) {
    console.error("Erro ao buscar contatos do mailing:", error);
    return {
      success: false,
      contacts: [],
      error: error.message
    };
  }
}
