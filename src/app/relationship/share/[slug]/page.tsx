import { Metadata } from 'next';
import SharePageClient from './client';

export const metadata: Metadata = {
  title: 'Shared Relationship | TianJi Global',
  description: 'View a shared relationship analysis',
};

export default function SharePage() {
  return <SharePageClient />;
}
