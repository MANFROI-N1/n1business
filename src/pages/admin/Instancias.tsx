
import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AddInstanceDialog } from "@/components/instancias/AddInstanceDialog";
import { SearchBar } from "@/components/instancias/SearchBar";
import { InstanciasContent } from "@/components/instancias/InstanciasContent";
import { useInstancias } from "@/hooks/use-instancias";

export default function InstanciasPage() {
  const {
    searchTerm,
    setSearchTerm,
    isAddDialogOpen,
    setIsAddDialogOpen,
    newInstance,
    setNewInstance,
    filteredData,
    paginatedData,
    currentPage,
    totalPages,
    goToPage,
    isLoading,
    isError,
    error,
    refetch,
    handleNewInstance,
    handleDeleteInstance
  } = useInstancias();

  return (
    <AdminLayout>
      <ErrorBoundary>
        <div className="w-full overflow-hidden">
          <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
            <h1 className="text-xl sm:text-2xl font-bold">Instâncias</h1>
            <AddInstanceDialog
              isOpen={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
              newInstance={newInstance}
              setNewInstance={setNewInstance}
              onAddInstance={handleNewInstance}
            />
          </div>

          <div className="mb-3 w-full">
            <SearchBar 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
            />
          </div>

          <InstanciasContent
            isLoading={isLoading}
            isError={isError}
            error={error}
            filteredData={filteredData}
            paginatedData={paginatedData}
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={goToPage}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            refetch={refetch}
            onDelete={handleDeleteInstance}
          />
        </div>
      </ErrorBoundary>
    </AdminLayout>
  );
}
