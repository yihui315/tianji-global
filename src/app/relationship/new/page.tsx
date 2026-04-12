import { Metadata } from 'next';
import RelationshipNewClient from './client';

export const metadata: Metadata = {
  title: 'Relationship Analysis | TianJi Global',
  description: 'Analyze relationship compatibility with AI-powered astrology',
};

export default function RelationshipNewPage() {
  return <RelationshipNewClient />;
}
