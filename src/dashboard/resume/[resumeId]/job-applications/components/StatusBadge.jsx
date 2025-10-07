import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusLabel } from '@/services/types';

const StatusBadge = ({ status, size = 'default' }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'applied':
        return 'bg-gray-900 text-white border-gray-900';
      case 'interview':
        return 'bg-black text-white border-black';
      case 'rejected':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'accepted':
        return 'bg-black text-white border-black';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1',
    default: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <Badge
      className={`${getStatusStyle(status)} border ${
        sizeClasses[size]
      } inline-flex items-center gap-1.5 rounded-md font-medium`}
    >
      {getStatusLabel(status)}
    </Badge>
  );
};

export default StatusBadge;
