import { useState } from "react";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Mailing {
  id: number;
  name: string;
  records: number;
  uploadDate: Date;
  status: string;
}

interface MailingTableProps {
  mailings: Mailing[];
}

export function MailingTable({ mailings }: MailingTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredMailings = mailings.filter(mailing => 
    mailing.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div>
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar mailings..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Mailing</TableHead>
              <TableHead className="text-right">Registros</TableHead>
              <TableHead>Data de Upload</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMailings.length > 0 ? (
              filteredMailings.map((mailing) => (
                <TableRow key={mailing.id}>
                  <TableCell className="font-medium">{mailing.name}</TableCell>
                  <TableCell className="text-right">{mailing.records.toLocaleString()}</TableCell>
                  <TableCell>
                    {format(mailing.uploadDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Badge variant={mailing.status === "processado" ? "success" : "secondary"}>
                      {mailing.status === "processado" ? "Processado" : "Em processamento"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Visualizar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  Nenhum mailing encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
