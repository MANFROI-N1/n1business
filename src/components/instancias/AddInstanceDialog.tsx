import React from "react";
import { NewInstanceFormData } from "@/types/instancia";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";

interface AddInstanceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newInstance: NewInstanceFormData;
  setNewInstance: React.Dispatch<React.SetStateAction<NewInstanceFormData>>;
  onAddInstance: () => Promise<void>;
}

export const AddInstanceDialog: React.FC<AddInstanceDialogProps> = ({
  isOpen,
  onOpenChange,
  newInstance,
  setNewInstance,
  onAddInstance,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button 
          className="bg-white text-black hover:bg-gray-100 flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Instância +
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar nova instância</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para adicionar uma nova instância.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label htmlFor="nome" className="text-sm font-medium">Nome da Aplicação</label>
            <Input
              id="nome"
              value={newInstance.nome}
              onChange={(e) => setNewInstance({...newInstance, nome: e.target.value})}
              placeholder="Nome da aplicação"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="instancia" className="text-sm font-medium">Número da Instância</label>
            <Input
              id="instancia"
              value={newInstance.instancia}
              onChange={(e) => setNewInstance({...newInstance, instancia: e.target.value})}
              placeholder="Número da instância (ex: 5548999999999)"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="day" className="text-sm font-medium">Dia</label>
            <Input
              id="day"
              value={newInstance.day}
              onChange={(e) => setNewInstance({...newInstance, day: e.target.value})}
              placeholder="Dia"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="periodo" className="text-sm font-medium">Período</label>
            <Input
              id="periodo"
              value={newInstance.periodo}
              onChange={(e) => setNewInstance({...newInstance, periodo: e.target.value})}
              placeholder="Período"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="quantidade" className="text-sm font-medium">Quantidade</label>
            <Input
              id="quantidade"
              value={newInstance.quantidade}
              onChange={(e) => setNewInstance({...newInstance, quantidade: e.target.value})}
              placeholder="Quantidade"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="token" className="text-sm font-medium">Token</label>
            <Input
              id="token"
              value={newInstance.token}
              onChange={(e) => setNewInstance({...newInstance, token: e.target.value})}
              placeholder="Token da instância"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">Status</label>
            <select
              id="status"
              value={newInstance.status}
              onChange={(e) => setNewInstance({...newInstance, status: e.target.value})}
              className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600/30 focus-visible:border-zinc-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
            >
              <option value="true" className="bg-zinc-800 text-zinc-300">Conectado</option>
              <option value="false" className="bg-zinc-800 text-zinc-300">Desconectado</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={onAddInstance}>Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
