"use client";

import ConversationArchivesDataTable from "@/components/dashboard/ConversationArchivesDataTable";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Suspense } from "react";

const ConversationArchivesPage = () => {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading conversation archives..." />}>
      <ConversationArchivesDataTable />
    </Suspense>
  );
};

export default ConversationArchivesPage;
