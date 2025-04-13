
import { GupTpData, NewInstanceFormData } from "@/types/instancia";

export interface InstanciasState {
  searchTerm: string;
  isAddDialogOpen: boolean;
  newInstance: NewInstanceFormData;
  currentPage: number;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}
