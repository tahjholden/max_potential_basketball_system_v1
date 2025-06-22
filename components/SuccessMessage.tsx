"use client";

import { useEffect, useState } from "react";

interface SuccessMessageProps {
  message: string;
  duration?: number;
  onTimeout?: () => void;
}

export default function SuccessMessage({ 
  message, 
  duration = 3000,
  onTimeout 
}: SuccessMessageProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
      if (onTimeout) {
        onTimeout();
      }
    }, duration);
    return () => clearTimeout(timeout);
  }, [duration, onTimeout, message]);

  if (!visible) return null;

  return (
    <div className="mt-2 text-xs text-gold font-medium transition-opacity duration-500 ease-in-out">
      ✔ {message}
    </div>
  );
} 