/**
 *  Notification Component
 * Provides user feedback for  operations
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Copy, 
  ExternalLink,
  Loader2
} from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
  txHash?: string;
  blockExplorerUrl?: string;
}

interface NotificationProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

export function NotificationComponent({ notification, onDismiss }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(notification.id), 300);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.id, onDismiss]);

  const getNotificationStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          icon: 'text-green-400',
          iconBg: 'bg-green-500/20'
        };
      case 'error':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: 'text-red-400',
          iconBg: 'bg-red-500/20'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          icon: 'text-yellow-400',
          iconBg: 'bg-yellow-500/20'
        };
      case 'info':
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          icon: 'text-blue-400',
          iconBg: 'bg-blue-500/20'
        };
      case 'loading':
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/30',
          icon: 'text-gray-400',
          iconBg: 'bg-gray-500/20'
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/30',
          icon: 'text-gray-400',
          iconBg: 'bg-gray-500/20'
        };
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 animate-spin" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const styles = getNotificationStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-xl border ${styles.bg} ${styles.border}`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
              <div className={styles.icon}>
                {getIcon()}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white mb-1">
                {notification.title}
              </h3>
              <p className="text-sm text-gray-300 mb-3">
                {notification.message}
              </p>

              {/* Transaction Hash */}
              {notification.txHash && (
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-gray-800 px-2 py-1 rounded text-blue-400 flex-1">
                      {notification.txHash.slice(0, 10)}...{notification.txHash.slice(-8)}
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(notification.txHash!)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Copy className="w-3 h-3 text-gray-400" />
                    </button>
                    {notification.blockExplorerUrl && (
                      <a
                        href={notification.blockExplorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 hover:bg-gray-700 rounded transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex gap-2">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                        action.variant === 'primary'
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onDismiss(notification.id), 300);
              }}
              className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 *  Notification Manager
 */
interface NotificationManagerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function NotificationManager({ notifications, onDismiss }: NotificationManagerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notification) => (
        <NotificationComponent
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

/**
 * Hook for managing  notifications
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    };

    setNotifications(prev => [...prev, newNotification]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Predefined notification creators
  const showSuccess = (title: string, message: string, options?: Partial<Notification>) => {
    addNotification({
      type: 'success',
      title,
      message,
      ...options
    });
  };

  const showError = (title: string, message: string, options?: Partial<Notification>) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: 8000, // Longer duration for errors
      ...options
    });
  };

  const showWarning = (title: string, message: string, options?: Partial<Notification>) => {
    addNotification({
      type: 'warning',
      title,
      message,
      ...options
    });
  };

  const showInfo = (title: string, message: string, options?: Partial<Notification>) => {
    addNotification({
      type: 'info',
      title,
      message,
      ...options
    });
  };

  const showLoading = (title: string, message: string, options?: Partial<Notification>) => {
    addNotification({
      type: 'loading',
      title,
      message,
      duration: 0, // No auto-dismiss for loading
      ...options
    });
  };

  const showTransactionSuccess = (txHash: string, network: string = 'ethereum') => {
    const blockExplorerUrl = network === 'ethereum' 
      ? `https://etherscan.io/tx/${txHash}`
      : `https://polygonscan.com/tx/${txHash}`;

    addNotification({
      type: 'success',
      title: 'Transaction Successful',
      message: 'Your transaction has been confirmed on the blockchain.',
      txHash,
      blockExplorerUrl,
      duration: 10000,
      actions: [
        {
          label: 'View on Explorer',
          action: () => window.open(blockExplorerUrl, '_blank'),
          variant: 'primary'
        }
      ]
    });
  };

  const showTransactionError = (error: string, txHash?: string) => {
    addNotification({
      type: 'error',
      title: 'Transaction Failed',
      message: error,
      txHash,
      duration: 10000
    });
  };

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showTransactionSuccess,
    showTransactionError
  };
}


