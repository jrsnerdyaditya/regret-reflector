import { useState, useEffect } from "react";
import { TaskCard } from "@/components/TaskCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Task, TaskStorage, DateUtils, AutoProcessor } from "@/lib/storage";

export const DatesTab = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({});

  const refreshTasks = () => {
    const allTasks = TaskStorage.getAll();
    setTasks(allTasks);

    // Group tasks by date (either created date or carry forward date)
    const grouped: Record<string, Task[]> = {};
    
    allTasks.forEach(task => {
      const displayDate = task.carryForwardDate || task.createdDate;
      if (!grouped[displayDate]) {
        grouped[displayDate] = [];
      }
      grouped[displayDate].push(task);
    });

    setTasksByDate(grouped);
  };

  useEffect(() => {
    // Process carry forwards and regrets on app launch
    AutoProcessor.processCarryForwardAndRegrets();
    refreshTasks();
  }, []);

  const handleAddTodayCard = () => {
    const today = DateUtils.getToday();
    // Create today's card if it doesn't exist
    if (!tasksByDate[today]) {
      refreshTasks(); // This will show the empty card
    }
  };

  // Get sorted dates (newest first)
  const sortedDates = Object.keys(tasksByDate)
    .sort((a, b) => b.localeCompare(a));

  // Ensure today is always shown (even if empty)
  const today = DateUtils.getToday();
  if (!sortedDates.includes(today)) {
    sortedDates.unshift(today);
  }

  return (
    <div className="flex-1 pb-20 mobile-scroll">
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Your Tasks</h1>
          <p className="text-muted-foreground text-sm">
            Stay organized and productive
          </p>
        </div>

        <div className="space-y-4">
          {sortedDates.map(date => (
            <TaskCard
              key={date}
              date={date}
              tasks={tasksByDate[date] || []}
              onTaskUpdate={refreshTasks}
            />
          ))}

          {sortedDates.length === 1 && !tasksByDate[today]?.length && (
            <div className="text-center py-12 text-muted-foreground">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Welcome to Smart Task Manager!</h3>
                <p className="text-sm max-w-sm mx-auto">
                  Start by adding your first task. Normal tasks carry forward automatically, 
                  deadline tasks move to regrets if missed.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <FloatingActionButton onClick={handleAddTodayCard} />
    </div>
  );
};