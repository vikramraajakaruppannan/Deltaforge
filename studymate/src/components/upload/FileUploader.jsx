import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { uploadDocument } from "@/lib/api";
import { toast } from "sonner";
import {
  Loader2,
  UploadCloud,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FileUploader() {
  // ← No types → pure JS
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFiles(acceptedFiles);
      toast.success(`Ready: ${acceptedFiles[0].name}`, {
        icon: <CheckCircle className="h-4 w-4" />,
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "application/pdf": [".pdf"] },
  });

  const removeFile = () => {
    setFiles([]);
    toast.info("File removed");
  };

  const handleUpload = async () => {
    if (!files.length) {
      toast.error("No file selected!");
      return;
    }

    setIsUploading(true);
    try {
      await uploadDocument(files[0], title || files[0].name);
      toast.success("Document uploaded successfully!", {
        description: "Your study material is now ready for AI analysis.",
        duration: 5000,
      });
      setFiles([]);
      setTitle("");
    } catch (err) {
      toast.error("Upload failed", {
        description: "Please try again or check your connection.",
        icon: <AlertCircle className="h-4 w-4" />,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const file = files[0];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Upload Study Material
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Drop your PDF notes, textbooks, or past papers here. Our AI will
            extract, summarize, and turn them into smart study tools.
          </p>
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`relative group cursor-pointer transition-all duration-300 rounded-2xl p-12 border-2 border-dashed overflow-hidden ${
            isDragActive
              ? "border-primary bg-primary/10 shadow-2xl shadow-primary/20"
              : "border-border bg-card/50 hover:bg-card/80"
          }`}
        >
          <input {...getInputProps()} />

          {/* Subtle hover glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-600/20" />
          </div>

          <div className="relative z-10 text-center space-y-6">
            <motion.div
              animate={{
                y: isDragActive ? -10 : 0,
                scale: isDragActive ? 1.1 : 1,
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10">
                <UploadCloud className="h-12 w-12 text-primary" />
              </div>
            </motion.div>

            <div className="space-y-2">
              <p className="text-lg font-semibold">
                {isDragActive ? (
                  <span className="text-primary">Drop it like it's hot</span>
                ) : (
                  "Drag & drop your PDF here"
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                or <span className="text-primary font-medium underline">click to browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Only PDF files • Max 100MB
              </p>
            </div>
          </div>

          {/* Drag wave effect */}
          {isDragActive && (
            <motion.div
              className="absolute inset-0 bg-primary/5 pointer-events-none"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.4, opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </div>

        {/* File Preview */}
        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <Card className="p-5 bg-gradient-to-r from-primary/5 to-purple-600/5 border-primary/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • PDF
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="hover:bg-destructive/10 hover:text-destructive rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <span>Title (Optional)</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
              Helps with search & organization
            </span>
          </label>
          <Input
            placeholder="e.g., Calculus II Notes, Physics Textbook Ch. 5"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 text-base"
          />
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          size="lg"
          className="w-full h-14 text-lg font-bold rounded-xl shadow-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-3 h-6 w-6 animate-spin" />
              Uploading & Processing...
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-5 w-5" />
              Upload & Analyze with AI
            </>
          )}
        </Button>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Your files are encrypted and processed securely. We support textbooks,
          handwritten notes, slides, past papers, and more.
        </p>
      </motion.div>
    </div>
  );
}