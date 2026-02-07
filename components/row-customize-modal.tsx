"use client"

import { useState, useEffect, useMemo } from "react"
import { ArrowUpDown, Save, RotateCcw, List, AlertCircle, Maximize2, Minimize2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { hasDeliveryToday, DeliveryMode } from "@/components/delivery-settings-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface RowCustomSort {
  id: string
  customOrder: number | null
}

export interface SavedSortList {
  id: string
  name: string
  sortConfig: RowCustomSort[]
  createdAt: Date
}

interface RowCustomizeModalProps<T extends { id: string; code: string; location: string; deliveryMode?: string }> {
  open: boolean
  onOpenChange: (open: boolean) => void
  rows: T[]
  onApplySort: (sortConfig: RowCustomSort[]) => void
  regionKey: string // For storing saved lists per region
  currentSort?: RowCustomSort[] | null // Current custom sort to maintain
}

export function RowCustomizeModal<T extends { id: string; code: string; location: string; deliveryMode?: string }>({
  open,
  onOpenChange,
  rows,
  onApplySort,
  regionKey,
  currentSort,
}: RowCustomizeModalProps<T>) {
  const { t } = useLanguage()
  const [sortConfig, setSortConfig] = useState<RowCustomSort[]>([])
  const [savedLists, setSavedLists] = useState<SavedSortList[]>([])
  const [newListName, setNewListName] = useState("")
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Detect duplicates
  const duplicates = useMemo(() => {
    const orderMap = new Map<number, string[]>()
    sortConfig.forEach(config => {
      if (config.customOrder !== null) {
        const existing = orderMap.get(config.customOrder) || []
        const rowInfo = rows.find(r => r.id === config.id)
        if (rowInfo) {
          existing.push(rowInfo.code)
          orderMap.set(config.customOrder, existing)
        }
      }
    })
    return Array.from(orderMap.entries())
      .filter(([_, codes]) => codes.length > 1)
      .map(([order, codes]) => ({ order, codes }))
  }, [sortConfig, rows])

  // Load saved lists from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`row-custom-sort-${regionKey}`)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSavedLists(parsed.map((list: any) => ({
          ...list,
          createdAt: new Date(list.createdAt),
        })))
      } catch (e) {
        console.error("Failed to load saved lists", e)
      }
    }
  }, [regionKey])

  // Initialize sort config from rows
  useEffect(() => {
    if (open && rows.length > 0) {
      setSortConfig(
        rows.map((row, idx) => ({
          id: row.id,
          customOrder: null, // Start with null to show original number as placeholder
        }))
      )
    }
  }, [open, rows])

  // Get original order for a row
  const getOriginalOrder = (id: string) => {
    const index = rows.findIndex(r => r.id === id)
    return index >= 0 ? index + 1 : 1
  }

  const updateCustomOrder = (id: string, value: string) => {
    const numValue = value === "" ? null : parseInt(value, 10)
    setSortConfig(prev =>
      prev.map(item =>
        item.id === id ? { ...item, customOrder: numValue } : item
      )
    )
  }

  const handleApply = () => {
    // Get rows with custom order
    const withCustomOrder = sortConfig.filter(c => c.customOrder !== null)
    const withoutCustomOrder = sortConfig.filter(c => c.customOrder === null)
    
    // Find max custom order
    const maxOrder = withCustomOrder.length > 0 
      ? Math.max(...withCustomOrder.map(c => c.customOrder!))
      : 0
    
    // Sort rows without custom order
    let nextOrder = maxOrder + 1
    const autoSorted = withoutCustomOrder.map(config => {
      const rowInfo = rows.find(r => r.id === config.id)
      return { config, rowInfo }
    })
    
    // Separate rows with and without delivery
    const withDelivery = autoSorted.filter(item => 
      item.rowInfo && hasDeliveryToday((item.rowInfo.deliveryMode || "daily") as DeliveryMode)
    )
    const withoutDelivery = autoSorted.filter(item => 
      item.rowInfo && !hasDeliveryToday((item.rowInfo.deliveryMode || "daily") as DeliveryMode)
    )
    
    // Sort by code, or use previous custom order if exists
    const sortByCodeOrPrevious = (items: typeof autoSorted) => {
      return items.sort((a, b) => {
        // Try to use previous custom order first
        if (currentSort) {
          const aPrevOrder = currentSort.find(s => s.id === a.config.id)?.customOrder
          const bPrevOrder = currentSort.find(s => s.id === b.config.id)?.customOrder
          if (aPrevOrder !== null && aPrevOrder !== undefined && 
              bPrevOrder !== null && bPrevOrder !== undefined) {
            return aPrevOrder - bPrevOrder
          }
        }
        // Fall back to code sorting
        const codeA = a.rowInfo?.code || ""
        const codeB = b.rowInfo?.code || ""
        return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' })
      })
    }
    
    // Apply auto ordering
    const sortedWithDelivery = sortByCodeOrPrevious(withDelivery)
    const sortedWithoutDelivery = sortByCodeOrPrevious(withoutDelivery)
    
    // Assign orders
    const autoAssigned = [
      ...sortedWithDelivery.map(item => ({
        ...item.config,
        customOrder: nextOrder++
      })),
      ...sortedWithoutDelivery.map(item => ({
        ...item.config,
        customOrder: nextOrder++
      }))
    ]
    
    // Combine with manually ordered rows
    const finalSort = [
      ...withCustomOrder,
      ...autoAssigned
    ].sort((a, b) => {
      if (a.customOrder === null) return 1
      if (b.customOrder === null) return -1
      return a.customOrder - b.customOrder
    })
    
    onApplySort(finalSort)
    onOpenChange(false)
  }

  const handleReset = () => {
    setSortConfig(
      rows.map((row) => ({
        id: row.id,
        customOrder: null, // Reset to null to show original order
      }))
    )
  }

  const handleSaveList = () => {
    if (!newListName.trim()) {
      alert("Please enter a list name")
      return
    }

    const newList: SavedSortList = {
      id: `list-${Date.now()}`,
      name: newListName.trim(),
      sortConfig: [...sortConfig],
      createdAt: new Date(),
    }

    const updatedLists = [...savedLists, newList]
    setSavedLists(updatedLists)
    localStorage.setItem(`row-custom-sort-${regionKey}`, JSON.stringify(updatedLists))
    
    setNewListName("")
    setShowSaveInput(false)
    alert(`Sort list "${newList.name}" saved!`)
  }

  const handleLoadList = (list: SavedSortList) => {
    setSortConfig(list.sortConfig)
  }

  const handleDeleteList = (listId: string) => {
    const updatedLists = savedLists.filter(list => list.id !== listId)
    setSavedLists(updatedLists)
    localStorage.setItem(`row-custom-sort-${regionKey}`, JSON.stringify(updatedLists))
  }

  const getRowInfo = (id: string) => {
    return rows.find(row => row.id === id)
  }

  // Sort table display by code for easier viewing
  const displaySortConfig = useMemo(() => {
    return [...sortConfig].sort((a, b) => {
      const rowA = getRowInfo(a.id)
      const rowB = getRowInfo(b.id)
      if (!rowA || !rowB) return 0
      const codeA = rowA.code || ""
      const codeB = rowB.code || ""
      return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' })
    })
  }, [sortConfig, rows])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        hideCloseButton
        className={`overflow-hidden flex flex-col ${
          isFullscreen 
            ? "max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] m-0 rounded-none" 
            : "sm:max-w-[700px] max-h-[85vh]"
        }`}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5" />
              {t('rowCustomize')} - {t('customSort')}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 p-0"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </DialogTitle>
          <DialogDescription>
            {t('rowCustomizeDesc')}
          </DialogDescription>
        </DialogHeader>

        {/* My List Dropdown */}
        <div className="flex items-center gap-2 pb-2 border-b">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <List className="h-4 w-4" />
                {t('myLists')} ({savedLists.length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {savedLists.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  {t('noSavedLists')}
                </div>
              ) : (
                savedLists.map(list => (
                  <DropdownMenuItem
                    key={list.id}
                    className="flex items-center justify-between"
                    onClick={() => handleLoadList(list)}
                  >
                    <span className="flex-1">{list.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Delete list "${list.name}"?`)) {
                          handleDeleteList(list.id)
                        }
                      }}
                    >
                      ×
                    </Button>
                  </DropdownMenuItem>
                ))
              )}
              {savedLists.length > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={() => setShowSaveInput(!showSaveInput)}>
                <Save className="h-4 w-4 mr-2" />
                {t('saveCurrentList')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {showSaveInput && (
            <div className="flex items-center gap-2 flex-1">
              <Input
                placeholder={t('enterListName')}
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                className="h-8"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveList()
                }}
              />
              <Button size="sm" onClick={handleSaveList}>{t('save')}</Button>
              <Button size="sm" variant="ghost" onClick={() => {
                setShowSaveInput(false)
                setNewListName("")
              }}>{t('cancel')}</Button>
            </div>
          )}
        </div>

        {/* Duplicate Warning */}
        {duplicates.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800 mb-1">Duplicate order numbers detected:</p>
              {duplicates.map(dup => (
                <p key={dup.order} className="text-yellow-700">
                  #{dup.order}: {dup.codes.join(', ')}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Info Note */}
        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
          <strong>Tip:</strong> The grayed numbers show the current order. 
          Only enter new numbers for rows you want to manually reposition. 
          Empty fields will auto-sort by code (or maintain previous custom order). 
          Rows without delivery will always appear last.
        </div>

        {/* Table */}
        <div className={`overflow-y-auto border rounded-lg ${
          isFullscreen ? "flex-1" : "max-h-[280px]"
        }`}>
          <table className="w-full">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                <th className="w-24 p-2 text-center text-xs font-medium">{t('no')} #</th>
                <th className="w-28 p-2 text-center text-xs font-medium">{t('code')}</th>
                <th className="p-2 text-center text-xs font-medium">{t('location')}</th>
              </tr>
            </thead>
            <tbody>
              {displaySortConfig.map((config) => {
                const rowInfo = getRowInfo(config.id)
                const originalOrder = getOriginalOrder(config.id)
                if (!rowInfo) return null

                return (
                  <tr
                    key={config.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-2 text-center relative">
                      <Input
                        type="number"
                        min="1"
                        value={config.customOrder ?? ""}
                        onChange={(e) => updateCustomOrder(config.id, e.target.value)}
                        className="h-8 w-20 text-center mx-auto [&:not(:focus)]:placeholder:text-muted-foreground/50"
                        placeholder={`${originalOrder}`}
                      />
                    </td>
                    <td className="p-2 text-sm font-medium text-center">{rowInfo.code}</td>
                    <td className="p-2 text-sm text-center">{rowInfo.location}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            {t('reset')}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleApply} className="gap-2">
              {t('applySort')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
