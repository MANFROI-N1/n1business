
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export const InstanciaCardSkeleton: React.FC = () => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-0 border-t">
        <div className="flex w-full">
          <Skeleton className="h-9 flex-1 rounded-none rounded-bl-lg" />
          <Skeleton className="h-9 flex-1 rounded-none rounded-br-lg" />
        </div>
      </CardFooter>
    </Card>
  );
};

export const InstanciasLoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(6).fill(0).map((_, index) => (
        <InstanciaCardSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );
};
