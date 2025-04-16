'use client';

export function getStatusBadge(status: string | null) {
  if (!status) return <span className="px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-800">Unknown</span>;
  
  switch (status.toLowerCase()) {
    case 'pending':
      return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pending</span>;
    case 'approved':
      return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Approved</span>;
    case 'rejected':
      return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Rejected</span>;
    case 'verified':
      return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Verified</span>;
    default:
      return <span className="px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-800">{status}</span>;
  }
}
