import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { summarizeDocument, getDocuments } from "@/lib/api";
import {
  Loader2,
  FileText,
  ChevronDown,
  Copy,
  Download,
  Sparkles,
  FileSearch,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";

export function SummarizePanel() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState("");
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  // Load documents on mount
  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await getDocuments();
        setDocuments(res || []);
      } catch {
        setError("Failed to load documents");
      } finally {
        setLoadingDocs(false);
      }
    }
    fetchDocs();
  }, []);

  const handleSummarize = async () => {
    if (!selectedDoc) {
      setError("Please select a document.");
      return;
    }

    setError("");
    setLoading(true);
    setSummary(null);

    try {
      const res = await summarizeDocument(selectedDoc);
      setSummary(res);
    } catch {
      setError("Failed to summarize document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Document Select Card */}
      <Card className="p-6 shadow-md border border-border/50 bg-card/80 backdrop-blur">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <FileSearch className="h-5 w-5 text-primary" />
          Choose a Document to Summarize
        </h3>

        {loadingDocs ? (
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading documents…
          </p>
        ) : (
          <select
            className="w-full border rounded-md px-3 py-2 text-sm bg-muted"
            value={selectedDoc}
            onChange={(e) => setSelectedDoc(e.target.value)}
          >
            <option value="">Select Document</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title} ({(doc.size_bytes / 1024 / 1024).toFixed(1)} MB)
              </option>
            ))}
          </select>
        )}

        <Button
          className="mt-4 w-full flex items-center gap-2"
          onClick={handleSummarize}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <FileText />}
          Summarize Document
        </Button>

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </Card>

      {/* Loading Spinner */}
      {loading && (
        <Card className="p-6 text-center shadow animate-pulse">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-3">Generating summary…</p>
        </Card>
      )}

      {summary && <SummarySections summary={summary} />}
    </div>
  );
}

function SummarySections({ summary }) {
  // Download summary as PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 10;

    doc.setFontSize(18);
    doc.text(summary.document_title, 10, y);
    y += 10;

    doc.setFontSize(12);

    summary.sections.forEach((sec) => {
      doc.text(`• ${sec.heading}`, 10, y);
      y += 6;

      const lines = Array.isArray(sec.summary)
        ? sec.summary
        : [sec.summary];

      lines.forEach((line) => {
        const wrapped = doc.splitTextToSize(line, 180);
        wrapped.forEach((w) => {
          doc.text(`- ${w}`, 12, y);
          y += 6;
        });
      });

      y += 4;
    });

    doc.save(`${summary.document_title}-summary.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Title + Download Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{summary.document_title}</h2>
          <p className="text-sm text-muted-foreground">
            {summary.total_sections} sections summarized
          </p>
        </div>

        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={downloadPDF}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div className="space-y-4">
        {summary.sections.map((sec, i) => (
          <SummaryItem key={i} item={sec} />
        ))}
      </div>
    </div>
  );
}

function SummaryItem({ item }) {
  const [open, setOpen] = useState(false);

  const copyToClipboard = () => {
    const text =
      Array.isArray(item.summary) ? item.summary.join("\n") : item.summary;
    navigator.clipboard.writeText(text);
  };

  return (
    <motion.div layout>
      <Card
        className="p-5 shadow-sm border border-border/50 bg-card hover:bg-muted/40 cursor-pointer transition rounded-xl"
        onClick={() => setOpen(!open)}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">{item.heading}</h3>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 text-sm text-foreground"
            >
              {/* Copy button */}
              <div className="flex justify-end mb-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent collapsing
                    copyToClipboard();
                  }}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>

              {/* Summary content */}
              {Array.isArray(item.summary) ? (
                <ul className="list-disc ml-6 space-y-1 text-muted-foreground">
                  {item.summary.map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">{item.summary}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
