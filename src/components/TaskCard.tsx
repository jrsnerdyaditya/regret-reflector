import { useState } from "react";
import { Check, Calendar, Clock, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, TaskStorage, DateUtils } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskCardProps {
  date: string;
  tasks: Task[];
  onTaskUpdate: () => void;
}

export const TaskCard = ({ date, tasks, onTaskUpdate }: TaskCardProps) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isDeadlineTask, setIsDeadlineTask] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");

  const isToday = date === DateUtils.getToday();
  const cardTitle = isToday ? "Today" : DateUtils.formatDate(date);

  const handleToggleTask = (task: Task) => {
    TaskStorage.update(task.id, { isCompleted: !task.isCompleted });
    onTaskUpdate();
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    let deadline = undefined;
    if (isDeadlineTask && deadlineDate) {
      deadline = deadlineTime 
        ? `${deadlineDate}T${deadlineTime}:00` 
        : `${deadlineDate}T23:59:00`;
    }

    TaskStorage.add({
      title: newTaskTitle.trim(),
      isCompleted: false,
      isDeadlineTask,
      deadline,
      createdDate: date,
    });

    setNewTaskTitle("");
    setIsDeadlineTask(false);
    setDeadlineDate("");
    setDeadlineTime("");
    setIsAddingTask(false);
    onTaskUpdate();
  };

  const handleDeleteTask = (taskId: string) => {
    TaskStorage.delete(taskId);
    onTaskUpdate();
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-md mb-4 overflow-hidden">
      {/* Card Header */}
      <div className={cn(
        "px-4 py-3 border-b border-border",
        isToday ? "bg-primary/5" : "bg-muted/30"
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={cn(
              "font-semibold text-base",
              isToday && "text-primary"
            )}>
              {cardTitle}
            </h3>
            {!isToday && (
              <p className="text-xs text-muted-foreground mt-1">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </p>
            )}
          </div>
          {isToday && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
              onClick={() => setIsAddingTask(!isAddingTask)}
            >
              <Plus size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Tasks List */}
      <div className="p-4 space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-3 group">
            <Checkbox
              checked={task.isCompleted}
              onCheckedChange={() => handleToggleTask(task)}
              className="mt-0.5 data-[state=checked]:bg-success data-[state=checked]:border-success"
            />
            
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium break-words",
                task.isCompleted && "line-through text-muted-foreground"
              )}>
                {task.title}
              </p>
              
              <div className="flex items-center gap-2 mt-1">
                {task.isDeadlineTask && task.deadline && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                    new Date(task.deadline) < new Date() 
                      ? "bg-regret/10 text-regret" 
                      : "bg-warning/10 text-warning"
                  )}>
                    <Clock size={10} />
                    <span>{DateUtils.formatDateTime(task.deadline)}</span>
                  </div>
                )}
                
                {task.carryForwardDate && task.createdDate !== task.carryForwardDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                    <Calendar size={10} />
                    <span>from {DateUtils.formatDate(task.createdDate)}</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost" 
              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => handleDeleteTask(task.id)}
            >
              ×
            </Button>
          </div>
        ))}

        {tasks.length === 0 && !isAddingTask && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="mx-auto mb-2 opacity-50" size={32} />
            <p className="text-sm">No tasks for this day</p>
          </div>
        )}

        {/* Add Task Form */}
        {isAddingTask && (
          <div className="border-t border-border pt-4 mt-4 space-y-3">
            <Input
              placeholder="Enter task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              className="text-sm"
              autoFocus
            />
            
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isDeadlineTask}
                onCheckedChange={(checked) => setIsDeadlineTask(checked === true)}
                id="deadline-task"
              />
              <label htmlFor="deadline-task" className="text-sm">
                Deadline task
              </label>
            </div>

            {isDeadlineTask && (
              <div className="space-y-2">
                <Input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  min={DateUtils.getToday()}
                  className="text-sm"
                  placeholder="Select date"
                />
                <Input
                  type="time"
                  value={deadlineTime}
                  onChange={(e) => setDeadlineTime(e.target.value)}
                  className="text-sm"
                  placeholder="Select time (optional)"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim() || (isDeadlineTask && !deadlineDate)}
                className="flex-1"
              >
                Add Task
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle("");
                  setIsDeadlineTask(false);
                  setDeadlineDate("");
                  setDeadlineTime("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};