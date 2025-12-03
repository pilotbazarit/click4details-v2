// app/products/edit/[id]/page.jsx
'use client';
import UpdateProductForm from '@/components/UpdateProductForm';
import { useParams } from 'next/navigation';

export default function EditProductPage() {
  const { id } = useParams();

  return <UpdateProductForm productId={id} />;
}