
import { useState, useEffect } from "react";
import { Pencil, Trash2, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Define the User type
interface User {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    role: string;
  };
  created_at: string;
}

type UsersListProps = {
  type?: "admin" | "manager" | "user";
  searchTerm?: string;
};

// Sample data for users
const userData: User[] = [
  { 
    id: "1", 
    email: "admin@example.com", 
    user_metadata: { name: "Admin User", role: "admin" }, 
    created_at: "2024-04-01T10:00:00Z" 
  },
  { 
    id: "2", 
    email: "manager1@example.com", 
    user_metadata: { name: "Manager One", role: "manager" }, 
    created_at: "2024-04-02T10:00:00Z" 
  },
  { 
    id: "3", 
    email: "manager2@example.com", 
    user_metadata: { name: "Manager Two", role: "manager" }, 
    created_at: "2024-04-02T11:30:00Z" 
  },
  { 
    id: "4", 
    email: "user1@example.com", 
    user_metadata: { name: "Regular User One", role: "user" }, 
    created_at: "2024-04-03T09:15:00Z" 
  },
  { 
    id: "5", 
    email: "user2@example.com", 
    user_metadata: { name: "Regular User Two", role: "user" }, 
    created_at: "2024-04-03T14:20:00Z" 
  },
  { 
    id: "6", 
    email: "user3@example.com", 
    user_metadata: { name: "Regular User Three", role: "user" }, 
    created_at: "2024-04-04T08:45:00Z" 
  },
  { 
    id: "7", 
    email: "admin2@example.com", 
    user_metadata: { name: "Another Admin", role: "admin" }, 
    created_at: "2024-04-05T16:30:00Z" 
  },
  { 
    id: "8", 
    email: "manager3@example.com", 
    user_metadata: { name: "Manager Three", role: "manager" }, 
    created_at: "2024-04-06T11:00:00Z" 
  }
];

export default function UsersList({ type, searchTerm = "" }: UsersListProps) {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 3; // Changed from 5 to 3

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    
    setTimeout(() => {
      let filtered = [...userData];
      
      // Filter by role type if specified
      if (type) {
        filtered = filtered.filter(user => user.user_metadata?.role === type);
      }
      
      // Filter by search term if provided
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(user => 
          (user.user_metadata?.name || "").toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term)
        );
      }
      
      setFilteredUsers(filtered);
      setTotalPages(Math.max(1, Math.ceil(filtered.length / itemsPerPage)));
      setCurrentPage(1); // Reset to first page when filters change
      setLoading(false);
    }, 500); // Simulate a network delay
  }, [type, searchTerm]);

  // Render role with badge
  const renderRole = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-500">Administrador</Badge>;
      case "manager":
        return <Badge variant="secondary">Gerente</Badge>;
      default:
        return <Badge variant="outline">Usuário</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get current page items
  const getCurrentItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4 && totalPages > 4) {
      if (startPage === 1) {
        endPage = Math.min(5, totalPages);
      } else {
        startPage = Math.max(1, endPage - 4);
      }
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Data de criação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                <div className="flex justify-center">
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Carregando usuários...</p>
              </TableCell>
            </TableRow>
          ) : filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10">
                <p className="text-muted-foreground">Nenhum usuário encontrado</p>
              </TableCell>
            </TableRow>
          ) : (
            getCurrentItems().map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium py-3">
                  {user.user_metadata?.name || "—"}
                </TableCell>
                <TableCell className="py-3">{user.email}</TableCell>
                <TableCell className="py-3">
                  {renderRole(user.user_metadata?.role || "user")}
                </TableCell>
                <TableCell className="py-3">{formatDate(user.created_at)}</TableCell>
                <TableCell className="text-right py-3">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {!loading && filteredUsers.length > 0 && (
        <div className="flex flex-col items-center space-y-1 mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {pageNumbers[0] > 1 && (
                <>
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
                  </PaginationItem>
                  {pageNumbers[0] > 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </>
              )}

              {pageNumbers.map(pageNum => (
                <PaginationItem key={pageNum}>
                  <PaginationLink 
                    isActive={currentPage === pageNum} 
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <div className="text-sm text-muted-foreground">
            Mostrando página {currentPage} de {totalPages} (Total: {filteredUsers.length} usuários)
          </div>
        </div>
      )}
    </div>
  );
}
