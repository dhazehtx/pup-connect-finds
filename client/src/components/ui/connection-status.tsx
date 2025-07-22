
import React from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface ConnectionStatusProps {
  isOnline: boolean;
  isConnecting?: boolean;
  className?: string;
}

const ConnectionStatus = ({ isOnline, isConnecting = false, className = "" }: ConnectionStatusProps) => {
  if (isOnline && !isConnecting) return null;

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {isConnecting ? (
        <>
          <AlertTriangle size={16} className="text-yellow-500 animate-pulse" />
          <span className="text-yellow-600">Connecting...</span>
        </>
      ) : (
        <>
          <WifiOff size={16} className="text-red-500" />
          <span className="text-red-600">Offline</span>
        </>
      )}
    </div>
  );
};

export default ConnectionStatus;
