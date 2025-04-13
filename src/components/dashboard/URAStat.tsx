
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface URAStatProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  trend?: "up" | "down" | "neutral";
  emphasis?: boolean;
}

const URAStat = ({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend = "neutral",
  emphasis = false
}: URAStatProps) => {
  return (
    <Card className={cn(
      "overflow-hidden",
      emphasis && "border-green-500 bg-green-500/10"
    )}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            
            {description && (
              <p className={cn(
                "text-xs mt-1",
                trend === "up" && "text-green-500",
                trend === "down" && "text-red-500"
              )}>
                {description}
              </p>
            )}
          </div>
          
          <div className={cn(
            "p-2 rounded-full",
            emphasis ? "bg-green-500 text-white" : "bg-secondary"
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default URAStat;
