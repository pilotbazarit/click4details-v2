// app/products/edit/[id]/page.jsx
'use client';
import CloneProductForm from '@/components/CloneProductForm';
import { useParams } from 'next/navigation';

export default function CloneProductPage() {
  const { id } = useParams();

  return <CloneProductForm productId={id} />;
}