"use client";

import { useParams } from "next/navigation";

import { GeneralProductFormWizard } from "../../create/page";

export default function GeneralProductEditPage() {
  const { id } = useParams();

  return <GeneralProductFormWizard mode="edit" productId={id} />;
}
