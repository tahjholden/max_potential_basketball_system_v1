import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { colors, typography, borderRadius, transitions } from "@/lib/design-tokens";

// Button color types
type ButtonColor = "gold" | "danger" | "success" | "warning" | "archive" | "gray";

// Button variant types
type ButtonVariant = "solid" | "outline" | "text" | "ghost";

// Button size types
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

// Base button props
interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ButtonColor;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

// Color configurations for each variant
const colorConfigs = {
  gold: {
    solid: {
      bg: "bg-[#C2B56B]",
      text: "text-black",
      hover: "hover:bg-[#C2B56B]/80",
      focus: "focus:bg-[#C2B56B]/90",
      border: "border-[#C2B56B]",
    },
    outline: {
      bg: "bg-transparent",
      text: "text-[#C2B56B]",
      hover: "hover:bg-[#C2B56B]/10",
      focus: "focus:bg-[#C2B56B]/20",
      border: "border-[#C2B56B]",
    },
    text: {
      bg: "bg-transparent",
      text: "text-[#C2B56B]",
      hover: "hover:bg-[#C2B56B]/10",
      focus: "focus:bg-[#C2B56B]/20",
      border: "border-transparent",
    },
    ghost: {
      bg: "bg-transparent",
      text: "text-[#C2B56B]",
      hover: "hover:bg-[#C2B56B]/10",
      focus: "focus:bg-[#C2B56B]/20",
      border: "border-transparent",
    },
  },
  danger: {
    solid: {
      bg: "bg-[#A22828]",
      text: "text-white",
      hover: "hover:bg-[#A22828]/80",
      focus: "focus:bg-[#A22828]/90",
      border: "border-[#A22828]",
    },
    outline: {
      bg: "bg-transparent",
      text: "text-[#A22828]",
      hover: "hover:bg-[#A22828]/10",
      focus: "focus:bg-[#A22828]/20",
      border: "border-[#A22828]",
    },
    text: {
      bg: "bg-transparent",
      text: "text-[#A22828]",
      hover: "hover:bg-[#A22828]/10",
      focus: "focus:bg-[#A22828]/20",
      border: "border-transparent",
    },
    ghost: {
      bg: "bg-transparent",
      text: "text-[#A22828]",
      hover: "hover:bg-[#A22828]/10",
      focus: "focus:bg-[#A22828]/20",
      border: "border-transparent",
    },
  },
  success: {
    solid: {
      bg: "bg-green-500",
      text: "text-white",
      hover: "hover:bg-green-600",
      focus: "focus:bg-green-700",
      border: "border-green-500",
    },
    outline: {
      bg: "bg-transparent",
      text: "text-green-500",
      hover: "hover:bg-green-500/10",
      focus: "focus:bg-green-500/20",
      border: "border-green-500",
    },
    text: {
      bg: "bg-transparent",
      text: "text-green-500",
      hover: "hover:bg-green-500/10",
      focus: "focus:bg-green-500/20",
      border: "border-transparent",
    },
    ghost: {
      bg: "bg-transparent",
      text: "text-green-500",
      hover: "hover:bg-green-500/10",
      focus: "focus:bg-green-500/20",
      border: "border-transparent",
    },
  },
  warning: {
    solid: {
      bg: "bg-yellow-500",
      text: "text-black",
      hover: "hover:bg-yellow-600",
      focus: "focus:bg-yellow-700",
      border: "border-yellow-500",
    },
    outline: {
      bg: "bg-transparent",
      text: "text-yellow-500",
      hover: "hover:bg-yellow-500/10",
      focus: "focus:bg-yellow-500/20",
      border: "border-yellow-500",
    },
    text: {
      bg: "bg-transparent",
      text: "text-yellow-500",
      hover: "hover:bg-yellow-500/10",
      focus: "focus:bg-yellow-500/20",
      border: "border-transparent",
    },
    ghost: {
      bg: "bg-transparent",
      text: "text-yellow-500",
      hover: "hover:bg-yellow-500/10",
      focus: "focus:bg-yellow-500/20",
      border: "border-transparent",
    },
  },
  archive: {
    solid: {
      bg: "bg-gray-500",
      text: "text-white",
      hover: "hover:bg-gray-600",
      focus: "focus:bg-gray-700",
      border: "border-gray-500",
    },
    outline: {
      bg: "bg-transparent",
      text: "text-gray-400",
      hover: "hover:bg-gray-400/10",
      focus: "focus:bg-gray-400/20",
      border: "border-gray-400",
    },
    text: {
      bg: "bg-transparent",
      text: "text-gray-400",
      hover: "hover:bg-gray-400/10",
      focus: "focus:bg-gray-400/20",
      border: "border-transparent",
    },
    ghost: {
      bg: "bg-transparent",
      text: "text-gray-400",
      hover: "hover:bg-gray-400/10",
      focus: "focus:bg-gray-400/20",
      border: "border-transparent",
    },
  },
  gray: {
    solid: {
      bg: "bg-zinc-500",
      text: "text-white",
      hover: "hover:bg-zinc-600",
      focus: "focus:bg-zinc-700",
      border: "border-zinc-500",
    },
    outline: {
      bg: "bg-transparent",
      text: "text-zinc-300",
      hover: "hover:bg-zinc-700/20",
      focus: "focus:bg-zinc-700/30",
      border: "border-zinc-500",
    },
    text: {
      bg: "bg-transparent",
      text: "text-zinc-300",
      hover: "hover:bg-zinc-700/20",
      focus: "focus:bg-zinc-700/30",
      border: "border-transparent",
    },
    ghost: {
      bg: "bg-transparent",
      text: "text-zinc-300",
      hover: "hover:bg-zinc-700/20",
      focus: "focus:bg-zinc-700/30",
      border: "border-transparent",
    },
  },
};

// Size configurations
const sizeConfigs = {
  xs: {
    padding: "px-2 py-1",
    text: "text-xs",
    rounded: "rounded",
  },
  sm: {
    padding: "px-3 py-1.5",
    text: "text-sm",
    rounded: "rounded-md",
  },
  md: {
    padding: "px-4 py-2",
    text: "text-sm",
    rounded: "rounded-lg",
  },
  lg: {
    padding: "px-6 py-3",
    text: "text-base",
    rounded: "rounded-lg",
  },
  xl: {
    padding: "px-8 py-4",
    text: "text-lg",
    rounded: "rounded-xl",
  },
};

// Base button component
const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(
  ({ 
    color = "gold", 
    variant = "solid", 
    size = "md", 
    loading = false,
    children, 
    className = "", 
    disabled,
    ...props 
  }, ref) => {
    const colorConfig = colorConfigs[color][variant];
    const sizeConfig = sizeConfigs[size];
    
    const baseClasses = [
      "inline-flex items-center justify-center font-semibold transition-all duration-200",
      "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      colorConfig.bg,
      colorConfig.text,
      colorConfig.hover,
      colorConfig.focus,
      colorConfig.border,
      sizeConfig.padding,
      sizeConfig.text,
      sizeConfig.rounded,
      typography.button,
    ];

    return (
      <button
        ref={ref}
        className={cn(baseClasses, className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

BaseButton.displayName = "BaseButton";

// Convenience components for common use cases
export const UniversalButton = {
  // Primary buttons (solid gold)
  Primary: forwardRef<HTMLButtonElement, Omit<BaseButtonProps, 'color' | 'variant'>>(
    (props, ref) => <BaseButton ref={ref} color="gold" variant="solid" {...props} />
  ),
  
  // Secondary buttons (outline gold)
  Secondary: forwardRef<HTMLButtonElement, Omit<BaseButtonProps, 'color' | 'variant'>>(
    (props, ref) => <BaseButton ref={ref} color="gold" variant="outline" {...props} />
  ),
  
  // Danger buttons (solid red)
  Danger: forwardRef<HTMLButtonElement, Omit<BaseButtonProps, 'color' | 'variant'>>(
    (props, ref) => <BaseButton ref={ref} color="danger" variant="solid" {...props} />
  ),
  
  // Danger outline buttons
  DangerOutline: forwardRef<HTMLButtonElement, Omit<BaseButtonProps, 'color' | 'variant'>>(
    (props, ref) => <BaseButton ref={ref} color="danger" variant="outline" {...props} />
  ),
  
  // Success buttons (solid green)
  Success: forwardRef<HTMLButtonElement, Omit<BaseButtonProps, 'color' | 'variant'>>(
    (props, ref) => <BaseButton ref={ref} color="success" variant="solid" {...props} />
  ),
  
  // Warning buttons (solid yellow)
  Warning: forwardRef<HTMLButtonElement, Omit<BaseButtonProps, 'color' | 'variant'>>(
    (props, ref) => <BaseButton ref={ref} color="warning" variant="solid" {...props} />
  ),
  
  // Archive buttons (outline gray)
  Archive: forwardRef<HTMLButtonElement, Omit<BaseButtonProps, 'color' | 'variant'>>(
    (props, ref) => <BaseButton ref={ref} color="archive" variant="outline" {...props} />
  ),
  
  // Gray buttons (outline gray)
  Gray: forwardRef<HTMLButtonElement, Omit<BaseButtonProps, 'color' | 'variant'>>(
    (props, ref) => <BaseButton ref={ref} color="gray" variant="outline" {...props} />
  ),
  
  // Text buttons (no background)
  Text: forwardRef<HTMLButtonElement, Omit<BaseButtonProps, 'color' | 'variant'>>(
    (props, ref) => <BaseButton ref={ref} color="gold" variant="text" {...props} />
  ),
  
  // Ghost buttons (transparent)
  Ghost: forwardRef<HTMLButtonElement, Omit<BaseButtonProps, 'color' | 'variant'>>(
    (props, ref) => <BaseButton ref={ref} color="gray" variant="ghost" {...props} />
  ),
  
  // Base component for custom configurations
  Base: BaseButton,
};

// Set display names for all convenience components
UniversalButton.Primary.displayName = "UniversalButton.Primary";
UniversalButton.Secondary.displayName = "UniversalButton.Secondary";
UniversalButton.Danger.displayName = "UniversalButton.Danger";
UniversalButton.DangerOutline.displayName = "UniversalButton.DangerOutline";
UniversalButton.Success.displayName = "UniversalButton.Success";
UniversalButton.Warning.displayName = "UniversalButton.Warning";
UniversalButton.Archive.displayName = "UniversalButton.Archive";
UniversalButton.Gray.displayName = "UniversalButton.Gray";
UniversalButton.Text.displayName = "UniversalButton.Text";
UniversalButton.Ghost.displayName = "UniversalButton.Ghost";

export default UniversalButton; 