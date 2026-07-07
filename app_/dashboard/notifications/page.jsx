import { Suspense } from "react";
import NotificationsPageClient from "./NotificationsPageClient";

export const dynamic = "force-dynamic";

const NotificationsPage = () => {
  return (
    <Suspense fallback={<div className="p-6">Loading notifications...</div>}>
      <NotificationsPageClient />
    </Suspense>
  );
};

export default NotificationsPage;
