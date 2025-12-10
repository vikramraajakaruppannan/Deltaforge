import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText, ArrowUpRight, UploadCloud, Sparkles, Trash2, Eye } from "lucide-react";
import { getDocuments, deleteDocument, getDocumentStreamUrl } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function DocumentList() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocuments()
      .then((data) => setDocs(data || []))
      .catch((err) => {
        console.error("Failed to load documents:", err);
        setDocs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLocalDelete = async (doc) => {
    if (!confirm(`Delete "${doc.title}"?`)) return;

    try {
      await deleteDocument(doc.id);
      toast.success("Document deleted");

      // Remove document visually
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      toast.error("Delete failed");
      console.error(err);
    }
  };

  if (loading) return <LoadingGrid />;
  if (docs.length === 0) return <EmptyState />;

  return <DocumentsGrid docs={docs} onDelete={handleLocalDelete} />;
}

// ——— Loading State ———
function LoadingGrid() {
  return (
    <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-6">
          <div className="flex gap-4 animate-pulse">
            <div className="w-12 h-12 bg-muted rounded-xl" />
            <div className="space-y-3 flex-1">
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ——— Empty State ———
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-600/20">
        <UploadCloud className="h-12 w-12 text-primary" />
      </div>

      <h3 className="mb-3 text-2xl font-bold">No documents uploaded yet</h3>
      <p className="mb-6 max-w-md text-muted-foreground">
        Upload your first PDF and let the AI generate flashcards, summaries, and quizzes for you.
      </p>

      <div className="flex items-center gap-2 text-primary font-medium">
        <Sparkles className="h-5 w-5 animate-pulse" />
        <span>Your study assistant is ready</span>
        <Sparkles className="h-5 w-5 animate-pulse" />
      </div>
    </motion.div>
  );
}

// ——— Main Documents Grid ———
function DocumentsGrid({ docs, onDelete }) {
  return (
    <div className="grid gap-6 mt-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {docs.map((doc, index) => (
          <motion.div
            layout
            key={doc.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.06, type: "spring", stiffness: 300 }}
            whileHover={{ y: -6 }}
            className="group"
          >
            <Card className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-2xl">

              {/* Top Section — unchanged */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-1 items-start gap-4 min-w-0">
                  <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 p-3 transition-transform group-hover:scale-110">
                    <FileText className="h-7 w-7 text-primary" />
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <h4 className="font-semibold text-foreground leading-snug break-words">
                      {doc.title || "Untitled Document"}
                    </h4>
                    <p className="truncate text-xs text-muted-foreground">
                      {doc.file_name || "document.pdf"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(doc.size_bytes / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>

                {/* External Link */}
                {doc.public_url && (
                  <a
                    href={doc.public_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-shrink-0 rounded-full bg-primary/10 p-2.5 transition-all hover:bg-primary/20 group-hover:rotate-12"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ArrowUpRight className="h-5 w-5 text-primary" />
                  </a>
                )}
              </div>

              {/* NEW SECTION: Actions */}
              <div className="mt-4 flex items-center justify-between">

                {/* Delete Document */}
                <button
                  className="text-red-500 hover:bg-red-100 p-2 rounded-full transition"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(doc);
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Upload Date (unchanged) */}
              {doc.created_at && (
                <p className="mt-5 text-xs text-muted-foreground/70">
                  {new Date(doc.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
