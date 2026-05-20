'use client';
import ViewProductForm from '@/components/ViewProductForm';
import { useParams } from 'next/navigation';

export default function ViewProductPage() {
  const { id } = useParams();

  return <ViewProductForm productId={id} />;
}