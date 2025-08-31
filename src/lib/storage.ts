// Local storage utilities for Smart Task Manager
// Using localStorage/IndexedDB for offline persistence

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  isDeadlineTask: boolean;
  deadline?: string; // ISO datetime string
  createdDate: string; // ISO date string
  carryForwardDate?: string; // ISO date string
}

export interface Regret {
  id: string;
  taskId?: string; // Foreign key to task
  title: string;
  originalDeadline: string; // ISO datetime string
  regretDate: string; // ISO date string
  reflectionNote?: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Storage keys
const STORAGE_KEYS = {
  TASKS: 'smart_task_manager_tasks',
  REGRETS: 'smart_task_manager_regrets',
  NOTES: 'smart_task_manager_notes',
  LAST_PROCESSED: 'smart_task_manager_last_processed'
} as const;

// Task storage operations
export const TaskStorage = {
  getAll: (): Task[] => {
    const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    return tasks ? JSON.parse(tasks) : [];
  },

  save: (tasks: Task[]): void => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  add: (task: Omit<Task, 'id'>): Task => {
    const tasks = TaskStorage.getAll();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
    };
    tasks.push(newTask);
    TaskStorage.save(tasks);
    return newTask;
  },

  update: (id: string, updates: Partial<Task>): void => {
    const tasks = TaskStorage.getAll();
    const index = tasks.findIndex(t => t.id === id);
    if (index >= 0) {
      tasks[index] = { ...tasks[index], ...updates };
      TaskStorage.save(tasks);
    }
  },

  delete: (id: string): void => {
    const tasks = TaskStorage.getAll().filter(t => t.id !== id);
    TaskStorage.save(tasks);
  },

  getByDate: (date: string): Task[] => {
    const tasks = TaskStorage.getAll();
    return tasks.filter(t => 
      t.createdDate === date || t.carryForwardDate === date
    );
  }
};

// Regret storage operations
export const RegretStorage = {
  getAll: (): Regret[] => {
    const regrets = localStorage.getItem(STORAGE_KEYS.REGRETS);
    return regrets ? JSON.parse(regrets) : [];
  },

  save: (regrets: Regret[]): void => {
    localStorage.setItem(STORAGE_KEYS.REGRETS, JSON.stringify(regrets));
  },

  add: (regret: Omit<Regret, 'id'>): Regret => {
    const regrets = RegretStorage.getAll();
    const newRegret: Regret = {
      ...regret,
      id: crypto.randomUUID(),
    };
    regrets.push(newRegret);
    RegretStorage.save(regrets);
    return newRegret;
  },

  update: (id: string, updates: Partial<Regret>): void => {
    const regrets = RegretStorage.getAll();
    const index = regrets.findIndex(r => r.id === id);
    if (index >= 0) {
      regrets[index] = { ...regrets[index], ...updates };
      RegretStorage.save(regrets);
    }
  },

  delete: (id: string): void => {
    const regrets = RegretStorage.getAll().filter(r => r.id !== id);
    RegretStorage.save(regrets);
  }
};

// Note storage operations
export const NoteStorage = {
  getAll: (): Note[] => {
    const notes = localStorage.getItem(STORAGE_KEYS.NOTES);
    return notes ? JSON.parse(notes) : [];
  },

  save: (notes: Note[]): void => {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  add: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
    const notes = NoteStorage.getAll();
    const now = new Date().toISOString();
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    notes.push(newNote);
    NoteStorage.save(notes);
    return newNote;
  },

  update: (id: string, updates: Partial<Note>): void => {
    const notes = NoteStorage.getAll();
    const index = notes.findIndex(n => n.id === id);
    if (index >= 0) {
      notes[index] = { 
        ...notes[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      NoteStorage.save(notes);
    }
  },

  delete: (id: string): void => {
    const notes = NoteStorage.getAll().filter(n => n.id !== id);
    NoteStorage.save(notes);
  },

  search: (query: string): Note[] => {
    const notes = NoteStorage.getAll();
    const lowerQuery = query.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowerQuery) ||
      note.body.toLowerCase().includes(lowerQuery)
    );
  }
};

// Auto-processing utilities
export const AutoProcessor = {
  getLastProcessed: (): string => {
    return localStorage.getItem(STORAGE_KEYS.LAST_PROCESSED) || '1970-01-01';
  },

  setLastProcessed: (date: string): void => {
    localStorage.setItem(STORAGE_KEYS.LAST_PROCESSED, date);
  },

  processCarryForwardAndRegrets: (): void => {
    const today = new Date().toISOString().split('T')[0];
    const lastProcessed = AutoProcessor.getLastProcessed();
    
    if (lastProcessed >= today) return; // Already processed today

    const tasks = TaskStorage.getAll();
    const regrets = RegretStorage.getAll();
    
    tasks.forEach(task => {
      if (task.isCompleted) return;

      if (task.isDeadlineTask && task.deadline) {
        // Check if deadline task is overdue
        const deadlineDate = task.deadline.split('T')[0];
        if (deadlineDate < today || (deadlineDate === today && new Date(task.deadline) < new Date())) {
          // Move to regrets
          const newRegret: Omit<Regret, 'id'> = {
            taskId: task.id,
            title: task.title,
            originalDeadline: task.deadline,
            regretDate: today,
          };
          RegretStorage.add(newRegret);
          TaskStorage.delete(task.id);
        }
      } else {
        // Normal task - carry forward if not completed
        if (task.createdDate < today && !task.carryForwardDate) {
          TaskStorage.update(task.id, { carryForwardDate: today });
        }
      }
    });

    AutoProcessor.setLastProcessed(today);
  }
};

// Date utilities
export const DateUtils = {
  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  },

  formatDateTime: (dateTimeString: string): string => {
    return new Date(dateTimeString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  },

  getToday: (): string => {
    return new Date().toISOString().split('T')[0];
  },

  getWeekStart: (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDay();
    const diff = date.getDate() - day; // Sunday is 0
    const weekStart = new Date(date.setDate(diff));
    return weekStart.toISOString().split('T')[0];
  },

  getWeekEnd: (weekStart: string): string => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + 6);
    return date.toISOString().split('T')[0];
  },

  formatWeekRange: (weekStart: string): string => {
    const start = new Date(weekStart);
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
};