
import React from "react";
import { 
  BarChart as BarChartIcon, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  PhoneCall, 
  User 
} from "lucide-react";
import URAStat from "./URAStat";

const URADashboard = () => {
  return (
    <div className="space-y-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <URAStat 
          title="CHAMADAS" 
          value="15,234" 
          icon={PhoneCall} 
          description="+12% em relação ao mês anterior" 
          trend="up"
        />
        <URAStat 
          title="ATENDIDAS" 
          value="12,543" 
          icon={CheckCircle} 
          description="+8% em relação ao mês anterior" 
          trend="up"
        />
        <URAStat 
          title="MINUTAGEM" 
          value="45,328" 
          icon={Clock} 
          description="+5% em relação ao mês anterior" 
          trend="up"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <URAStat 
          title="SIM CALL" 
          value="8,412" 
          icon={PhoneCall} 
          description="+3% em relação ao mês anterior" 
          trend="up"
        />
        <URAStat 
          title="SIM WHT'S" 
          value="6,821" 
          icon={MessageSquare} 
          description="+15% em relação ao mês anterior" 
          trend="up"
          emphasis
        />
        <URAStat 
          title="LEAD POR P.A." 
          value="234" 
          icon={User} 
          description="+7% em relação ao mês anterior" 
          trend="up"
        />
      </div>
    </div>
  );
};

export default URADashboard;
