import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { FileUploader } from "@/components/upload/FileUploader";

export default function Upload() {
  return (
    <MainLayout>
      <h1 className="text-xl font-semibold mb-6">Upload Materials</h1>
      <FileUploader />
    </MainLayout>
  );
}
