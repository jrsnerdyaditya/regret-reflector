import { useState, useEffect } from "react";
import { Search, StickyNote, Edit3, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Note, NoteStorage, DateUtils } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const NotesTab = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");

  const refreshNotes = () => {
    const allNotes = NoteStorage.getAll();
    // Sort by updated date (most recent first)
    const sorted = allNotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    setNotes(sorted);
  };

  useEffect(() => {
    refreshNotes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = NoteStorage.search(searchQuery);
      setFilteredNotes(filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    } else {
      setFilteredNotes(notes);
    }
  }, [searchQuery, notes]);

  const handleAddNote = () => {
    setIsAddingNote(true);
    setNoteTitle("");
    setNoteBody("");
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteBody(note.body);
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim()) return;

    if (editingNote) {
      // Update existing note
      NoteStorage.update(editingNote.id, {
        title: noteTitle.trim(),
        body: noteBody.trim(),
      });
    } else {
      // Add new note
      NoteStorage.add({
        title: noteTitle.trim(),
        body: noteBody.trim(),
      });
    }

    setIsAddingNote(false);
    setEditingNote(null);
    setNoteTitle("");
    setNoteBody("");
    refreshNotes();
  };

  const handleCancelEdit = () => {
    setIsAddingNote(false);
    setEditingNote(null);
    setNoteTitle("");
    setNoteBody("");
  };

  const handleDeleteNote = (noteId: string) => {
    NoteStorage.delete(noteId);
    refreshNotes();
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return DateUtils.formatDate(dateString.split('T')[0]);
  };

  const isDialogOpen = isAddingNote || editingNote !== null;

  return (
    <>
      <div className="flex-1 pb-20 mobile-scroll">
        <div className="p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">Notes</h1>
            <p className="text-muted-foreground text-sm">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} saved
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Notes List */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? (
                <>
                  <Search className="mx-auto mb-4 opacity-50" size={32} />
                  <h3 className="text-lg font-medium mb-2">No notes found</h3>
                  <p className="text-sm">
                    Try searching with different keywords
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent flex items-center justify-center">
                    <StickyNote size={24} className="text-accent-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No notes yet</h3>
                  <p className="text-sm max-w-sm mx-auto">
                    Start capturing your thoughts and ideas. Tap the + button to create your first note.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotes.map((note) => (
                <div 
                  key={note.id} 
                  className="bg-card rounded-lg border border-border shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-base break-words flex-1">
                        {note.title}
                      </h3>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => handleEditNote(note)}
                        >
                          <Edit3 size={14} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>

                    {note.body && (
                      <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap line-clamp-3">
                        {note.body}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Updated {formatRelativeTime(note.updatedAt)}</span>
                      {note.createdAt !== note.updatedAt && (
                        <span>Created {formatRelativeTime(note.createdAt)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <FloatingActionButton onClick={handleAddNote} />

      {/* Add/Edit Note Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCancelEdit}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? 'Edit Note' : 'Add New Note'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Title
              </label>
              <Input
                placeholder="Enter note title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Content
              </label>
              <Textarea
                placeholder="Write your note here..."
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveNote}
                disabled={!noteTitle.trim()}
                className="flex-1"
              >
                {editingNote ? 'Update Note' : 'Save Note'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};