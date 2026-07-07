'use client';
import ViewProductForm from '@/components/ViewProductForm';
import ViewUserDetails from '@/components/ViewUserDetails';
import { useParams } from 'next/navigation';

export default function ViewUserDetailsPage() {
  const { id } = useParams();

  return <ViewUserDetails userId={id} />;
}