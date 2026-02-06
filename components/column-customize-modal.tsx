"use client"

import { useState, useEffect } from "react"
import { ArrowUp, ArrowDown, Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useLanguage } from "@/contexts/language-context"

export interface ColumnConfig {
  id: string
  label: string
  visible: boolean
  order: number
  locked?: boolean // Some columns like "No" or "Action" should always be visible
}

interface ColumnCustomizeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  columns: ColumnConfig[]
  onColumnsChange: (columns: ColumnConfig[]) => void
}

export function ColumnCustomizeModal({
  open,
  onOpenChange,
  columns,
  onColumnsChange,
}: ColumnCustomizeModalProps) {
  const { t } = useLanguage()
  const [localColumns, setLocalColumns] = useState<ColumnConfig[]>(columns)

  useEffect(() => {
    setLocalColumns(columns)
  }, [columns])

  const toggleVisibility = (id: string) => {
    setLocalColumns(prev =>
      prev.map(col =>
        col.id === id && !col.locked ? { ...col, visible: !col.visible } : col
      )
    )
  }

  const moveUp = (index: number) => {
    if (index === 0) return
    const newColumns = [...localColumns]
    ;[newColumns[index], newColumns[index - 1]] = [newColumns[index - 1], newColumns[index]]
    // Update order
    newColumns.forEach((col, idx) => {
      col.order = idx
    })
    setLocalColumns(newColumns)
  }

  const moveDown = (index: number) => {
    if (index === localColumns.length - 1) return
    const newColumns = [...localColumns]
    ;[newColumns[index], newColumns[index + 1]] = [newColumns[index + 1], newColumns[index]]
    // Update order
    newColumns.forEach((col, idx) => {
      col.order = idx
    })
    setLocalColumns(newColumns)
  }

  const handleApply = () => {
    onColumnsChange(localColumns)
    onOpenChange(false)
  }

  const handleReset = () => {
    // Reset to original columns state
    const resetColumns = columns.map((col, idx) => ({
      ...col,
      visible: true,
      order: idx,
    }))
    setLocalColumns(resetColumns)
    onColumnsChange(resetColumns)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {t('columnCustomize')}
          </DialogTitle>
          <DialogDescription>
            {t('columnCustomizeDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4 max-h-[400px] overflow-y-auto">
          {localColumns.map((column, index) => (
            <div
              key={column.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                checked={column.visible}
                disabled={column.locked}
                onCheckedChange={() => toggleVisibility(column.id)}
                className="flex-shrink-0"
              />
              
              <div className="flex-1 font-medium text-sm">
                {column.label}
                {column.locked && (
                  <span className="text-xs text-muted-foreground ml-2">({t('required')})</span>
                )}
              </div>

              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => moveDown(index)}
                  disabled={index === localColumns.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            {t('reset')}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleApply}>
              {t('apply')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
