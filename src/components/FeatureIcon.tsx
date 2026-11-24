'use client';

import {
  Wifi,
  Utensils,
  Bus,
  Plane,
  Shield,
  Sparkles,
  Waves,
  Car,
  Bell,
  Compass,
  MapPin,
  Snowflake,
  CheckCircle2,
} from 'lucide-react';
import type { FeatureIconKey } from '@/data/serviceFeatures';

export default function FeatureIcon({
  name,
  className = 'w-4 h-4',
}: {
  name: FeatureIconKey;
  className?: string;
}) {
  switch (name) {
    case 'wifi':
      return <Wifi className={className} />;
    case 'utensils':
      return <Utensils className={className} />;
    case 'bus':
      return <Bus className={className} />;
    case 'plane':
      return <Plane className={className} />;
    case 'shield':
      return <Shield className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'waves':
      return <Waves className={className} />;
    case 'car':
      return <Car className={className} />;
    case 'bell':
      return <Bell className={className} />;
    case 'compass':
      return <Compass className={className} />;
    case 'mapPin':
      return <MapPin className={className} />;
    case 'snowflake':
      return <Snowflake className={className} />;
    default:
      return <CheckCircle2 className={className} />;
  }
}
