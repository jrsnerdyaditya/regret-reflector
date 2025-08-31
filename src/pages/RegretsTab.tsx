import { useState, useEffect } from "react";
import { Heart, Calendar, Edit3, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Regret, RegretStorage, DateUtils } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const RegretsTab = () => {
  const [regrets, setRegrets] = useState<Regret[]>([]);
  const [editingRegret, setEditingRegret] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState("");

  const refreshRegrets = () => {
    const allRegrets = RegretStorage.getAll();
    // Sort by regret date (most recent first)
    const sorted = allRegrets.sort((a, b) => b.regretDate.localeCompare(a.regretDate));
    setRegrets(sorted);
  };

  useEffect(() => {
    refreshRegrets();
  }, []);

  const handleStartEditing = (regret: Regret) => {
    setEditingRegret(regret.id);
    setEditingNote(regret.reflectionNote || "");
  };

  const handleSaveNote = (regretId: string) => {
    RegretStorage.update(regretId, { reflectionNote: editingNote.trim() || undefined });
    setEditingRegret(null);
    setEditingNote("");
    refreshRegrets();
  };

  const handleCancelEditing = () => {
    setEditingRegret(null);
    setEditingNote("");
  };

  const handleDeleteRegret = (regretId: string) => {
    RegretStorage.delete(regretId);
    refreshRegrets();
  };

  if (regrets.length === 0) {
    return (
      <div className="flex-1 pb-20 mobile-scroll">
        <div className="p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Regrets</h1>
            <p className="text-muted-foreground text-sm">
              Missed deadlines and reflections
            </p>
          </div>

          <div className="text-center py-12 text-muted-foreground">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <Heart size={24} className="text-success" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Regrets Yet!</h3>
            <p className="text-sm max-w-sm mx-auto">
              Keep up the great work! Deadline tasks that are missed will appear here 
              for reflection and learning.
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Regrets</h1>
          <p className="text-muted-foreground text-sm">
            {regrets.length} missed {regrets.length === 1 ? 'deadline' : 'deadlines'}
          </p>
        </div>

        <div className="space-y-4">
          {regrets.map((regret) => (
            <div key={regret.id} className="bg-card rounded-lg border border-border shadow-md overflow-hidden">
              {/* Regret Header */}
              <div className="px-4 py-3 border-b border-border bg-regret/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base text-regret break-words">
                      {regret.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        <Calendar size={10} />
                        <span>Due: {DateUtils.formatDate(regret.originalDeadline)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-regret bg-regret/10 px-2 py-1 rounded-full">
                        <Heart size={10} />
                        <span>Missed: {DateUtils.formatDate(regret.regretDate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteRegret(regret.id)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>

              {/* Reflection Section */}
              <div className="p-4">
                {editingRegret === regret.id ? (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      Reflection Notes:
                    </label>
                    <Textarea
                      placeholder="What can you learn from this? How can you prevent it next time?"
                      value={editingNote}
                      onChange={(e) => setEditingNote(e.target.value)}
                      className="min-h-[100px] text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveNote(regret.id)}
                        className="flex-1"
                      >
                        <Save size={14} className="mr-1" />
                        Save Reflection
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEditing}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {regret.reflectionNote ? (
                      <div className="bg-muted/30 rounded-md p-3 mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">Reflection:</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => handleStartEditing(regret)}
                          >
                            <Edit3 size={12} />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {regret.reflectionNote}
                        </p>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEditing(regret)}
                        className="w-full text-muted-foreground border-dashed"
                      >
                        <Edit3 size={14} className="mr-2" />
                        Add reflection notes
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Learning Section */}
        {regrets.length > 0 && (
          <div className="mt-8 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="font-semibold text-primary mb-2">💡 Learning Opportunity</h3>
            <p className="text-sm text-muted-foreground">
              Each missed deadline is a chance to improve. Consider what led to missing these 
              deadlines and how you can better manage your time and commitments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};