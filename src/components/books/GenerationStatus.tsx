import { AlertCircle, CheckCircle, Clock, Loader } from 'lucide-react';
import { BookStatus } from '../../types/book';

interface GenerationStatusProps {
  status: BookStatus;
  progress: string;
  onRetry?: () => void;
}

export function GenerationStatus({ status, progress, onRetry }: GenerationStatusProps) {
  const statusConfig = {
    [BookStatus.DRAFT]: {
      icon: Clock,
      color: 'text-gray-500',
      label: 'Waiting to start'
    },
    [BookStatus.GENERATING]: {
      icon: Loader,
      color: 'text-blue-500',
      label: 'Generating'
    },
    [BookStatus.COMPLETED]: {
      icon: CheckCircle,
      color: 'text-green-500',
      label: 'Completed'
    },
    [BookStatus.FAILED]: {
      icon: AlertCircle,
      color: 'text-red-500',
      label: 'Failed'
    }
  };

  const config = statusConfig[status];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-4">
        <config.icon className={`h-6 w-6 ${config.color}`} />
        <h2 className="text-lg font-semibold">{config.label}</h2>
      </div>
      
      <p className="text-gray-600 mb-4">{progress}</p>
      
      {status === BookStatus.FAILED && onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 transition-colors"
        >
          Retry Generation
        </button>
      )}
    </div>
  );
}