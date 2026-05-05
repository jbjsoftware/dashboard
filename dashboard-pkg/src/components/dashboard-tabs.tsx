'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Copy, Trash2, Pencil } from 'lucide-react';
import { Button } from '@repo/ui/components/ui/button';
import { Input } from '@repo/ui/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/ui/dropdown-menu';
import { cn } from '@repo/ui/lib/utils';
import type { Dashboard } from '../types';

interface DashboardTabsProps {
  dashboards: Dashboard[];
  activeDashboardId: string;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DashboardTabs({
  dashboards,
  activeDashboardId,
  onSelect,
  onCreate,
  onRename,
  onDuplicate,
  onDelete,
}: DashboardTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [contextId, setContextId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const commitRename = () => {
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex items-center gap-1 min-w-0 overflow-x-auto scrollbar-none">
      {dashboards.map((dashboard) => {
        const isActive = dashboard.id === activeDashboardId;
        const isEditing = editingId === dashboard.id;

        return (
          <DropdownMenu
            key={dashboard.id}
            open={contextId === dashboard.id}
            onOpenChange={(open) => setContextId(open ? dashboard.id : null)}
          >
            <DropdownMenuTrigger asChild>
              <span className="inline-flex" onPointerDown={(e) => e.preventDefault()}>
                <button
                  className={cn(
                    'relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                    'hover:bg-accent/50',
                    isActive
                      ? 'bg-accent text-accent-foreground shadow-sm'
                      : 'text-muted-foreground',
                  )}
                  onClick={() => {
                    if (!isEditing) {
                      onSelect(dashboard.id);
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    startRename(dashboard.id, dashboard.name);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextId(dashboard.id);
                  }}
                >
                  {isEditing ? (
                    <Input
                      ref={inputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRename();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="h-5 w-24 px-1 py-0 text-sm border-none bg-transparent focus-visible:ring-1"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    dashboard.name
                  )}
                </button>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem onClick={() => startRename(dashboard.id, dashboard.name)}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(dashboard.id)}>
                <Copy className="mr-2 h-3.5 w-3.5" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(dashboard.id)}
                disabled={dashboards.length <= 1}
                className="text-red-500 focus:text-red-500"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0"
        onClick={() => onCreate(`Dashboard ${dashboards.length + 1}`)}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
