"use client";

import { useParams } from "next/navigation";
import GeneralProductApprovalView from "@/components/GeneralProductApprovalView";

export default function RequestedGeneralProductPage() {
  const { id } = useParams();

  return <GeneralProductApprovalView productId={id} />;
}
