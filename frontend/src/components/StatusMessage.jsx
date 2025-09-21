import React from 'react';
import { CheckCircle, AlertCircle, Music } from 'lucide-react';

const StatusMessage = ({ status }) => {
  if (!status) return null;

  const getStatusStyle = () => {
    if (status.includes('success') || status.includes('loaded')) {
      return 'bg-green-50 text-green-800 border border-green-200';
    } else if (status.includes('Error') || status.includes('Please')) {
      return 'bg-red-50 text-red-800 border border-red-200';
    } else {
      return 'bg-blue-50 text-blue-800 border border-blue-200';
    }
  };

  const getStatusIcon = () => {
    if (status.includes('success') || status.includes('loaded')) {
      return <CheckCircle className="w-5 h-5" />;
    } else if (status.includes('Error') || status.includes('Please')) {
      return <AlertCircle className="w-5 h-5" />;
    } else {
      return <Music className="w-5 h-5" />;
    }
  };

  return (
    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${getStatusStyle()}`}>
      {getStatusIcon()}
      {status}
    </div>
  );
};

export default StatusMessage;