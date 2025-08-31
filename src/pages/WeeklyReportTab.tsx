import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, TaskStorage, DateUtils } from "@/lib/storage";
import { Button } from "@/components/ui/button";

interface WeeklyGroup {
  weekStart: string;
  weekEnd: string;
  tasks: Task[];
}

export const WeeklyReportTab = () => {
  const [weeklyGroups, setWeeklyGroups] = useState<WeeklyGroup[]>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const tasks = TaskStorage.getAll();
    
    // Filter carry-forward tasks (tasks that have been moved from their original date)
    const carriedTasks = tasks.filter(task => 
      task.carryForwardDate && !task.isCompleted && !task.isDeadlineTask
    );

    // Group by week
    const weekGroups: Record<string, Task[]> = {};
    
    carriedTasks.forEach(task => {
      const originalDate = task.createdDate;
      const weekStart = DateUtils.getWeekStart(originalDate);
      
      if (!weekGroups[weekStart]) {
        weekGroups[weekStart] = [];
      }
      weekGroups[weekStart].push(task);
    });

    // Convert to array and sort (most recent weeks first)
    const groupedArray = Object.keys(weekGroups)
      .map(weekStart => ({
        weekStart,
        weekEnd: DateUtils.getWeekEnd(weekStart),
        tasks: weekGroups[weekStart].sort((a, b) => a.createdDate.localeCompare(b.createdDate))
      }))
      .sort((a, b) => b.weekStart.localeCompare(a.weekStart));

    setWeeklyGroups(groupedArray);

    // Auto-expand the most recent week
    if (groupedArray.length > 0) {
      setExpandedWeeks(new Set([groupedArray[0].weekStart]));
    }
  }, []);

  const toggleWeekExpansion = (weekStart: string) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekStart)) {
      newExpanded.delete(weekStart);
    } else {
      newExpanded.add(weekStart);
    }
    setExpandedWeeks(newExpanded);
  };

  if (weeklyGroups.length === 0) {
    return (
      <div className="flex-1 pb-20 mobile-scroll">
        <div className="p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Weekly Report</h1>
            <p className="text-muted-foreground text-sm">
              Track tasks carried forward from previous weeks
            </p>
          </div>

          <div className="text-center py-12 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/10 flex items-center justify-center">
              <Calendar size={24} className="text-secondary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Carried Tasks</h3>
            <p className="text-sm max-w-sm mx-auto">
              Tasks that aren't completed will appear here when they're carried forward to new days.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-20 mobile-scroll">
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Weekly Report</h1>
          <p className="text-muted-foreground text-sm">
            {weeklyGroups.reduce((acc, group) => acc + group.tasks.length, 0)} tasks carried forward
          </p>
        </div>

        <div className="space-y-3">
          {weeklyGroups.map((group) => {
            const isExpanded = expandedWeeks.has(group.weekStart);
            
            return (
              <div key={group.weekStart} className="bg-card rounded-lg border border-border overflow-hidden">
                <Button
                  variant="ghost"
                  className="w-full p-4 h-auto justify-between hover:bg-accent/50"
                  onClick={() => toggleWeekExpansion(group.weekStart)}
                >
                  <div className="text-left">
                    <div className="font-medium text-base">
                      Week of {DateUtils.formatWeekRange(group.weekStart)}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {group.tasks.length} {group.tasks.length === 1 ? 'task' : 'tasks'} carried forward
                    </div>
                  </div>
                  
                  {isExpanded ? (
                    <ChevronDown size={20} className="text-muted-foreground" />
                  ) : (
                    <ChevronRight size={20} className="text-muted-foreground" />
                  )}
                </Button>

                {isExpanded && (
                  <div className="border-t border-border p-4 bg-muted/20">
                    <div className="space-y-3">
                      {group.tasks.map((task) => (
                        <div key={task.id} className="flex items-start gap-3 p-3 bg-card rounded-md border border-border/50">
                          <div className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0" />
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium break-words">
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                <Calendar size={10} />
                                <span>Originally: {DateUtils.formatDate(task.createdDate)}</span>
                              </div>
                              {task.carryForwardDate && (
                                <div className="flex items-center gap-1 text-xs text-warning bg-warning/10 px-2 py-1 rounded-full">
                                  <span>Moved to: {DateUtils.formatDate(task.carryForwardDate)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};