import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusLabel, getStatusColor } from '@/services/types';
import {
  Clock,
  Send,
  MessageCircle,
  XCircle,
  CheckCircle,
  FileText,
} from 'lucide-react';

const StatusBadge = ({ status, showIcon = false, size = 'default' }) => {
  const getStatusIcon = (status) => {
    const iconProps = { className: 'w-3 h-3' };
    switch (status) {
      case 'draft':
        return <Clock {...iconProps} />;
      case 'applied':
        return <Send {...iconProps} />;
      case 'interview':
        return <MessageCircle {...iconProps} />;
      case 'rejected':
        return <XCircle {...iconProps} />;
      case 'accepted':
        return <CheckCircle {...iconProps} />;
      default:
        return <FileText {...iconProps} />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <Badge
      className={`${getStatusColor(
        status
      )} text-white font-medium inline-flex items-center gap-1 ${
        sizeClasses[size]
      }`}
    >
      {showIcon && getStatusIcon(status)}
      {getStatusLabel(status)}
    </Badge>
  );
};

export default StatusBadge;
