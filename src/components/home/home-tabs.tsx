import { BookOpen, BarChart } from "lucide-react";

import { HomeTab } from "@/lib/hooks/use-home-page";
import { Button } from "@/components/ui/button";

interface HomeTabsProps {
  activeTab: HomeTab;
  onTabChange: (tab: HomeTab) => void;
}

export function HomeTabs({ activeTab, onTabChange }: HomeTabsProps) {
  const baseClass = "rounded-none px-4 py-2 font-medium transition-colors mx-2";
  const activeClass = "border-b-2 border-pink-500 text-foreground";
  const inactiveClass =
    "border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-transparent";

  return (
    <div className="mb-6">
      <div className="flex justify-center">
        <Button
          variant="ghost"
          className={`${baseClass} ${
            activeTab === "mantras" ? activeClass : inactiveClass
          }`}
          onClick={() => onTabChange("mantras")}
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Mantras
        </Button>
        <Button
          variant="ghost"
          className={`${baseClass} ${
            activeTab === "statistics" ? activeClass : inactiveClass
          }`}
          onClick={() => onTabChange("statistics")}
        >
          <BarChart className="w-4 h-4 mr-2" />
          Statistics
        </Button>
      </div>
    </div>
  );
}
