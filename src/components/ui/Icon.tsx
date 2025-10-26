import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface IconProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

export function Icon({ 
  icon: IconComponent, 
  size = 'md', 
  className,
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = false,
  ...props 
}: IconProps) {
  return (
    <IconComponent
      className={cn(sizeClasses[size], className)}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      {...props}
    />
  );
}

// Simple icon exports - import as needed
export { 
  Menu, X, ChevronDown, ChevronRight, ChevronUp, Search, Heart, Share, Download,
  Facebook, Twitter, Instagram, Linkedin, Microscope, FlaskConical, Beaker, Dna,
  Check, XCircle, AlertCircle, Info, Mail, Phone, MessageCircle, ShoppingCart, Star, Package,
  Eye, EyeOff, Volume2, VolumeX, Users, Shield, Loader2, BookOpen, Globe, Award,
  TrendingUp, ExternalLink, ArrowRight, CheckCircle, Clock, HelpCircle,
  Droplets, Sun, Moon
} from 'lucide-react';