import React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { DocumentList } from "@/components/documents/DocumentList";

export default function Documents() {
  return (
    <MainLayout>
      <h1 className="text-xl font-semibold mb-4">My Documents</h1>
      <DocumentList />
    </MainLayout>
  );
}
