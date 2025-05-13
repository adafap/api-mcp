'use client';

import { Switch } from '@/components/ui/switch';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AppCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  onToggle: () => void;
}

export function AppCard({
  name,
  description,
  icon: Icon,
  enabled,
  onToggle,
}: AppCardProps) {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-md ${enabled ? 'bg-secondary' : 'bg-muted'}`}
            >
              <Icon
                className={`w-5 h-5 ${enabled ? 'text-secondary-foreground' : 'text-muted-foreground'}`}
              />
            </div>
            <div>
              <h3 className="font-medium text-sm">{name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            className="ml-4"
          />
        </div>
      </CardContent>
    </Card>
  );
}
