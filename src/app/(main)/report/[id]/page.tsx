'use client';

import { useParams } from 'next/navigation';

export default function ReportPage() {
  const params = useParams<{ id: string }>();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Fortune Report</h1>
      <p className="text-gray-600">Report ID: {params.id}</p>
      <div className="mt-8 p-6 bg-white rounded-lg shadow">
        <p className="text-gray-500">AI-generated fortune report will be displayed here.</p>
      </div>
    </main>
  );
}
