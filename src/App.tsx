import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TabNavigation } from "@/components/TabNavigation";
import { DatesTab } from "@/pages/DatesTab";
import { WeeklyReportTab } from "@/pages/WeeklyReportTab";
import { RegretsTab } from "@/pages/RegretsTab";
import { NotesTab } from "@/pages/NotesTab";
import { AutoProcessor } from "@/lib/storage";

const queryClient = new QueryClient();

const App = () => {
  const [activeTab, setActiveTab] = useState('dates');

  // Process carry forwards and regrets on app launch
  useEffect(() => {
    AutoProcessor.processCarryForwardAndRegrets();
  }, []);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dates':
        return <DatesTab />;
      case 'weekly':
        return <WeeklyReportTab />;
      case 'regrets':
        return <RegretsTab />;
      case 'notes':
        return <NotesTab />;
      default:
        return <DatesTab />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-background flex flex-col">
          {renderActiveTab()}
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
