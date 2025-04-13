export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      atendidas: {
        Row: {
          created_at: string
          id: number
          Whatsapp: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          Whatsapp?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          Whatsapp?: string | null
        }
        Relationships: []
      }
      Global: {
        Row: {
          id: number
          created_at: string
          Beneficio: number | null
          CPF: number | null
          Nome: string | null
          Nome_Mae: string | null
          DDB: string | null
          DIB: string | null
          Valor_Beneficio: number | null
          Data_Nascimento: string | null
          Idade: number | null
          RG: string | null
          Codigo_Especie: number | null
          Meio_Pagamento: string | null
          Banco: string | null
          Agencia: string | null
          Conta: string | null
          Municipio: string | null
          UF: string | null
          Bairro: string | null
          Endereco: string | null
          CEP: string | null
          Margem_Disponivel: number | null
          Emprestimo_Ativos: number | null
          Bloqueado_Emprestimo: string | null
          Margem_RMC: string | null
          Margem_RCC: string | null
          Possui_Representante: string | null
          Nome_Representante: string | null
          CPF_Representante: string | null
          Desconto_Associacao: string | null
          Telefone1: string | null
          Telefone2: string | null
          Telefone3: string | null
          Email1: string | null
          Email2: string | null
          Email3: string | null
          origem: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          Beneficio?: number | null
          CPF?: number | null
          Nome?: string | null
          Nome_Mae?: string | null
          DDB?: string | null
          DIB?: string | null
          Valor_Beneficio?: number | null
          Data_Nascimento?: string | null
          Idade?: number | null
          RG?: string | null
          Codigo_Especie?: number | null
          Meio_Pagamento?: string | null
          Banco?: string | null
          Agencia?: string | null
          Conta?: string | null
          Municipio?: string | null
          UF?: string | null
          Bairro?: string | null
          Endereco?: string | null
          CEP?: string | null
          Margem_Disponivel?: number | null
          Emprestimo_Ativos?: number | null
          Bloqueado_Emprestimo?: string | null
          Margem_RMC?: string | null
          Margem_RCC?: string | null
          Possui_Representante?: string | null
          Nome_Representante?: string | null
          CPF_Representante?: string | null
          Desconto_Associacao?: string | null
          Telefone1?: string | null
          Telefone2?: string | null
          Telefone3?: string | null
          Email1?: string | null
          Email2?: string | null
          Email3?: string | null
          origem?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          Beneficio?: number | null
          CPF?: number | null
          Nome?: string | null
          Nome_Mae?: string | null
          DDB?: string | null
          DIB?: string | null
          Valor_Beneficio?: number | null
          Data_Nascimento?: string | null
          Idade?: number | null
          RG?: string | null
          Codigo_Especie?: number | null
          Meio_Pagamento?: string | null
          Banco?: string | null
          Agencia?: string | null
          Conta?: string | null
          Municipio?: string | null
          UF?: string | null
          Bairro?: string | null
          Endereco?: string | null
          CEP?: string | null
          Margem_Disponivel?: number | null
          Emprestimo_Ativos?: number | null
          Bloqueado_Emprestimo?: string | null
          Margem_RMC?: string | null
          Margem_RCC?: string | null
          Possui_Representante?: string | null
          Nome_Representante?: string | null
          CPF_Representante?: string | null
          Desconto_Associacao?: string | null
          Telefone1?: string | null
          Telefone2?: string | null
          Telefone3?: string | null
          Email1?: string | null
          Email2?: string | null
          Email3?: string | null
          origem?: string | null
        }
        Relationships: []
      }
      completaLimpa: {
        Row: {
          Consulta: string | null
          Cpf: string | null
          created_at: string
          Data: string | null
          Disparo: string | null
          existe_na_tabela_atendidas: boolean | null
          id: number
          idHuggy: string | null
          messageID: string | null
          Nome: string | null
          QuantidadeInt: string | null
          Rcanal: string | null
          Rconsulta: string[] | null
          Rdata: string | null
          "Relatorio.dataResposta": string[] | null
          Rinstancia: string | null
          Roperador: string | null
          Rquant: string | null
          Rtabulacao: string | null
          SimUra: string | null
          StatusConsulta: string | null
          threadId: string | null
          Whatsapp: string | null
        }
        Insert: {
          Consulta?: string | null
          Cpf?: string | null
          created_at?: string
          Data?: string | null
          Disparo?: string | null
          existe_na_tabela_atendidas?: boolean | null
          id?: number
          idHuggy?: string | null
          messageID?: string | null
          Nome?: string | null
          QuantidadeInt?: string | null
          Rcanal?: string | null
          Rconsulta?: string[] | null
          Rdata?: string | null
          "Relatorio.dataResposta"?: string[] | null
          Rinstancia?: string | null
          Roperador?: string | null
          Rquant?: string | null
          Rtabulacao?: string | null
          SimUra?: string | null
          StatusConsulta?: string | null
          threadId?: string | null
          Whatsapp?: string | null
        }
        Update: {
          Consulta?: string | null
          Cpf?: string | null
          created_at?: string
          Data?: string | null
          Disparo?: string | null
          existe_na_tabela_atendidas?: boolean | null
          id?: number
          idHuggy?: string | null
          messageID?: string | null
          Nome?: string | null
          QuantidadeInt?: string | null
          Rcanal?: string | null
          Rconsulta?: string[] | null
          Rdata?: string | null
          "Relatorio.dataResposta"?: string[] | null
          Rinstancia?: string | null
          Roperador?: string | null
          Rquant?: string | null
          Rtabulacao?: string | null
          SimUra?: string | null
          StatusConsulta?: string | null
          threadId?: string | null
          Whatsapp?: string | null
        }
        Relationships: []
      }
      completaLimpa_duplicate: {
        Row: {
          Consulta: string | null
          Cpf: string | null
          created_at: string
          Data: string | null
          Disparo: string | null
          existe_na_tabela_atendidas: boolean | null
          id: number
          idHuggy: string | null
          messageID: string | null
          Nome: string | null
          QuantidadeInt: string | null
          Rcanal: string | null
          Rconsulta: string[] | null
          Rdata: string | null
          "Relatorio.dataResposta": string[] | null
          Rinstancia: string | null
          Roperador: string | null
          Rquant: string | null
          Rtabulacao: string | null
          SimUra: string | null
          StatusConsulta: string | null
          threadId: string | null
          Whatsapp: string | null
        }
        Insert: {
          Consulta?: string | null
          Cpf?: string | null
          created_at?: string
          Data?: string | null
          Disparo?: string | null
          existe_na_tabela_atendidas?: boolean | null
          id?: number
          idHuggy?: string | null
          messageID?: string | null
          Nome?: string | null
          QuantidadeInt?: string | null
          Rcanal?: string | null
          Rconsulta?: string[] | null
          Rdata?: string | null
          "Relatorio.dataResposta"?: string[] | null
          Rinstancia?: string | null
          Roperador?: string | null
          Rquant?: string | null
          Rtabulacao?: string | null
          SimUra?: string | null
          StatusConsulta?: string | null
          threadId?: string | null
          Whatsapp?: string | null
        }
        Update: {
          Consulta?: string | null
          Cpf?: string | null
          created_at?: string
          Data?: string | null
          Disparo?: string | null
          existe_na_tabela_atendidas?: boolean | null
          id?: number
          idHuggy?: string | null
          messageID?: string | null
          Nome?: string | null
          QuantidadeInt?: string | null
          Rcanal?: string | null
          Rconsulta?: string[] | null
          Rdata?: string | null
          "Relatorio.dataResposta"?: string[] | null
          Rinstancia?: string | null
          Roperador?: string | null
          Rquant?: string | null
          Rtabulacao?: string | null
          SimUra?: string | null
          StatusConsulta?: string | null
          threadId?: string | null
          Whatsapp?: string | null
        }
        Relationships: []
      }
      completaLimpa_parte1: {
        Row: {
          Cpf: string | null
          created_at: string | null
          Data: string | null
          Disparo: string | null
          id: number | null
          messageID: string | null
          Nome: string | null
          SimUra: string | null
          Whatsapp: string | null
        }
        Insert: {
          Cpf?: string | null
          created_at?: string | null
          Data?: string | null
          Disparo?: string | null
          id?: number | null
          messageID?: string | null
          Nome?: string | null
          SimUra?: string | null
          Whatsapp?: string | null
        }
        Update: {
          Cpf?: string | null
          created_at?: string | null
          Data?: string | null
          Disparo?: string | null
          id?: number | null
          messageID?: string | null
          Nome?: string | null
          SimUra?: string | null
          Whatsapp?: string | null
        }
        Relationships: []
      }
      completaLimpa_parte2: {
        Row: {
          Cpf: string | null
          created_at: string | null
          Data: string | null
          Disparo: string | null
          id: number | null
          messageID: string | null
          Nome: string | null
          SimUra: string | null
          Whatsapp: string | null
        }
        Insert: {
          Cpf?: string | null
          created_at?: string | null
          Data?: string | null
          Disparo?: string | null
          id?: number | null
          messageID?: string | null
          Nome?: string | null
          SimUra?: string | null
          Whatsapp?: string | null
        }
        Update: {
          Cpf?: string | null
          created_at?: string | null
          Data?: string | null
          Disparo?: string | null
          id?: number | null
          messageID?: string | null
          Nome?: string | null
          SimUra?: string | null
          Whatsapp?: string | null
        }
        Relationships: []
      }
      Disparador: {
        Row: {
          Cpf: string | null
          created_at: string
          Disparador: string | null
          id: number
          Instancia: string | null
          Nome: string | null
          Whatsapp: string | null
        }
        Insert: {
          Cpf?: string | null
          created_at?: string
          Disparador?: string | null
          id?: number
          Instancia?: string | null
          Nome?: string | null
          Whatsapp?: string | null
        }
        Update: {
          Cpf?: string | null
          created_at?: string
          Disparador?: string | null
          id?: number
          Instancia?: string | null
          Nome?: string | null
          Whatsapp?: string | null
        }
        Relationships: []
      }
      GupTp: {
        Row: {
          appId: string | null
          Capacidade: string | null
          created_at: string
          DataCriacao: string | null
          Day: string | null
          id: number
          Instancia: string | null
          NomeAppGup: string | null
          NomeTemplate: string | null
          Periodo: string | null
          Quantidade: string | null
          Status: string | null
          statusTp: string | null
          templateId: string | null
          token: string | null
          tpCriar: string | null
        }
        Insert: {
          appId?: string | null
          Capacidade?: string | null
          created_at?: string
          DataCriacao?: string | null
          Day?: string | null
          id?: number
          Instancia?: string | null
          NomeAppGup?: string | null
          NomeTemplate?: string | null
          Periodo?: string | null
          Quantidade?: string | null
          Status?: string | null
          statusTp?: string | null
          templateId?: string | null
          token?: string | null
          tpCriar?: string | null
        }
        Update: {
          appId?: string | null
          Capacidade?: string | null
          created_at?: string
          DataCriacao?: string | null
          Day?: string | null
          id?: number
          Instancia?: string | null
          NomeAppGup?: string | null
          NomeTemplate?: string | null
          Periodo?: string | null
          Quantidade?: string | null
          Status?: string | null
          statusTp?: string | null
          templateId?: string | null
          token?: string | null
          tpCriar?: string | null
        }
        Relationships: []
      }
      GupTp_duplicate: {
        Row: {
          appId: string | null
          Capacidade: string | null
          created_at: string
          DataCriacao: string | null
          Day: string | null
          id: number
          Instancia: string | null
          NomeAppGup: string | null
          NomeTemplate: string | null
          Periodo: string | null
          Quantidade: string | null
          Status: string | null
          statusTp: string | null
          templateId: string | null
          token: string | null
          tpCriar: string | null
        }
        Insert: {
          appId?: string | null
          Capacidade?: string | null
          created_at?: string
          DataCriacao?: string | null
          Day?: string | null
          id?: number
          Instancia?: string | null
          NomeAppGup?: string | null
          NomeTemplate?: string | null
          Periodo?: string | null
          Quantidade?: string | null
          Status?: string | null
          statusTp?: string | null
          templateId?: string | null
          token?: string | null
          tpCriar?: string | null
        }
        Update: {
          appId?: string | null
          Capacidade?: string | null
          created_at?: string
          DataCriacao?: string | null
          Day?: string | null
          id?: number
          Instancia?: string | null
          NomeAppGup?: string | null
          NomeTemplate?: string | null
          Periodo?: string | null
          Quantidade?: string | null
          Status?: string | null
          statusTp?: string | null
          templateId?: string | null
          token?: string | null
          tpCriar?: string | null
        }
        Relationships: []
      }
      leilao_cp: {
        Row: {
          Agencia: string | null
          Bairro: string | null
          Banco: string | null
          Beneficio: string | null
          Bloqueado_Emprestimo: string | null
          CEP: string | null
          Codigo_Especie: string | null
          Conta: string | null
          CPF: string | null
          CPF_Representante: string | null
          created_at: string | null
          Data_Nascimento: string | null
          DDB: string | null
          Desconto_Associacao: string | null
          DIB: string | null
          Email1: string | null
          Email2: string | null
          Email3: string | null
          Emprestimo_Ativos: string | null
          Endereco: string | null
          Idade: string | null
          Margem_Disponivel: string | null
          Margem_RCC: string | null
          Margem_RMC: string | null
          Meio_Pagamento: string | null
          Municipio: string | null
          Nome: string | null
          Nome_Mae: string | null
          Nome_Representante: string | null
          Possui_Representante: string | null
          RG: string | null
          Telefone1: string | null
          Telefone2: string | null
          Telefone3: string | null
          UF: string | null
          Valor_Beneficio: string | null
        }
        Insert: {
          Agencia?: string | null
          Bairro?: string | null
          Banco?: string | null
          Beneficio?: string | null
          Bloqueado_Emprestimo?: string | null
          CEP?: string | null
          Codigo_Especie?: string | null
          Conta?: string | null
          CPF?: string | null
          CPF_Representante?: string | null
          created_at?: string | null
          Data_Nascimento?: string | null
          DDB?: string | null
          Desconto_Associacao?: string | null
          DIB?: string | null
          Email1?: string | null
          Email2?: string | null
          Email3?: string | null
          Emprestimo_Ativos?: string | null
          Endereco?: string | null
          Idade?: string | null
          Margem_Disponivel?: string | null
          Margem_RCC?: string | null
          Margem_RMC?: string | null
          Meio_Pagamento?: string | null
          Municipio?: string | null
          Nome?: string | null
          Nome_Mae?: string | null
          Nome_Representante?: string | null
          Possui_Representante?: string | null
          RG?: string | null
          Telefone1?: string | null
          Telefone2?: string | null
          Telefone3?: string | null
          UF?: string | null
          Valor_Beneficio?: string | null
        }
        Update: {
          Agencia?: string | null
          Bairro?: string | null
          Banco?: string | null
          Beneficio?: string | null
          Bloqueado_Emprestimo?: string | null
          CEP?: string | null
          Codigo_Especie?: string | null
          Conta?: string | null
          CPF?: string | null
          CPF_Representante?: string | null
          created_at?: string | null
          Data_Nascimento?: string | null
          DDB?: string | null
          Desconto_Associacao?: string | null
          DIB?: string | null
          Email1?: string | null
          Email2?: string | null
          Email3?: string | null
          Emprestimo_Ativos?: string | null
          Endereco?: string | null
          Idade?: string | null
          Margem_Disponivel?: string | null
          Margem_RCC?: string | null
          Margem_RMC?: string | null
          Meio_Pagamento?: string | null
          Municipio?: string | null
          Nome?: string | null
          Nome_Mae?: string | null
          Nome_Representante?: string | null
          Possui_Representante?: string | null
          RG?: string | null
          Telefone1?: string | null
          Telefone2?: string | null
          Telefone3?: string | null
          UF?: string | null
          Valor_Beneficio?: string | null
        }
        Relationships: []
      }
      message_buffer: {
        Row: {
          chatId: string | null
          content: string
          created_at: string
          id: number
          idMessage: string | null
          timestamp: number | null
        }
        Insert: {
          chatId?: string | null
          content: string
          created_at?: string
          id?: never
          idMessage?: string | null
          timestamp?: number | null
        }
        Update: {
          chatId?: string | null
          content?: string
          created_at?: string
          id?: never
          idMessage?: string | null
          timestamp?: number | null
        }
        Relationships: []
      }
      resultado_contagem: {
        Row: {
          criado_em: string | null
          data_filtro: string
          id: number
          total_linhas: number
        }
        Insert: {
          criado_em?: string | null
          data_filtro: string
          id?: number
          total_linhas: number
        }
        Update: {
          criado_em?: string | null
          data_filtro?: string
          id?: number
          total_linhas?: number
        }
        Relationships: []
      }
      resultado_pesquisa: {
        Row: {
          Consulta: string | null
          Cpf: string | null
          created_at: string | null
          Data: string | null
          Disparo: string | null
          existe_na_tabela_atendidas: boolean | null
          id: number | null
          idHuggy: string | null
          messageID: string | null
          Nome: string | null
          QuantidadeInt: string | null
          Rcanal: string | null
          Rconsulta: string | null
          Rdata: string | null
          Relatorio: string[] | null
          "Relatorio.dataResposta": string | null
          Rinstancia: string | null
          Roperador: string | null
          Rquant: string | null
          Rtabulacao: string | null
          SimUra: string | null
          StatusConsulta: string | null
          threadId: string | null
          Whatsapp: string | null
        }
        Insert: {
          Consulta?: string | null
          Cpf?: string | null
          created_at?: string | null
          Data?: string | null
          Disparo?: string | null
          existe_na_tabela_atendidas?: boolean | null
          id?: number | null
          idHuggy?: string | null
          messageID?: string | null
          Nome?: string | null
          QuantidadeInt?: string | null
          Rcanal?: string | null
          Rconsulta?: string | null
          Rdata?: string | null
          Relatorio?: string[] | null
          "Relatorio.dataResposta"?: string | null
          Rinstancia?: string | null
          Roperador?: string | null
          Rquant?: string | null
          Rtabulacao?: string | null
          SimUra?: string | null
          StatusConsulta?: string | null
          threadId?: string | null
          Whatsapp?: string | null
        }
        Update: {
          Consulta?: string | null
          Cpf?: string | null
          created_at?: string | null
          Data?: string | null
          Disparo?: string | null
          existe_na_tabela_atendidas?: boolean | null
          id?: number | null
          idHuggy?: string | null
          messageID?: string | null
          Nome?: string | null
          QuantidadeInt?: string | null
          Rcanal?: string | null
          Rconsulta?: string | null
          Rdata?: string | null
          Relatorio?: string[] | null
          "Relatorio.dataResposta"?: string | null
          Rinstancia?: string | null
          Roperador?: string | null
          Rquant?: string | null
          Rtabulacao?: string | null
          SimUra?: string | null
          StatusConsulta?: string | null
          threadId?: string | null
          Whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      export_csv: {
        Args: Record<PropertyKey, never>
        Returns: {
          csv_text: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
