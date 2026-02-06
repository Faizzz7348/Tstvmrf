"use client"

import { useState, useEffect } from "react"
import { ArrowUpDown, Save, RotateCcw, List } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
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

interface RowCustomizeModalProps<T extends { id: string; code: string; location: string }> {
  open: boolean
  onOpenChange: (open: boolean) => void
  rows: T[]
  onApplySort: (sortConfig: RowCustomSort[]) => void
  regionKey: string // For storing saved lists per region
}

export function RowCustomizeModal<T extends { id: string; code: string; location: string }>({
  open,
  onOpenChange,
  rows,
  onApplySort,
  regionKey,
}: RowCustomizeModalProps<T>) {
  const { t } = useLanguage()
  const [sortConfig, setSortConfig] = useState<RowCustomSort[]>([])
  const [savedLists, setSavedLists] = useState<SavedSortList[]>([])
  const [newListName, setNewListName] = useState("")
  const [showSaveInput, setShowSaveInput] = useState(false)

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
          customOrder: idx + 1,
        }))
      )
    }
  }, [open, rows])

  const updateCustomOrder = (id: string, value: string) => {
    const numValue = value === "" ? null : parseInt(value, 10)
    setSortConfig(prev =>
      prev.map(item =>
        item.id === id ? { ...item, customOrder: numValue } : item
      )
    )
  }

  const handleApply = () => {
    // Sort by custom order (nulls at end)
    const sorted = [...sortConfig].sort((a, b) => {
      if (a.customOrder === null) return 1
      if (b.customOrder === null) return -1
      return a.customOrder - b.customOrder
    })
    onApplySort(sorted)
    onOpenChange(false)
  }

  const handleReset = () => {
    setSortConfig(
      rows.map((row, idx) => ({
        id: row.id,
        customOrder: idx + 1,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            {t('rowCustomize')} - {t('customSort')}
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

        {/* Table */}
        <div className="flex-1 overflow-y-auto border rounded-lg">
          <table className="w-full">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                <th className="w-24 p-2 text-center text-xs font-medium">{t('no')} #</th>
                <th className="w-28 p-2 text-center text-xs font-medium">{t('code')}</th>
                <th className="p-2 text-center text-xs font-medium">{t('location')}</th>
              </tr>
            </thead>
            <tbody>
              {sortConfig.map((config) => {
                const rowInfo = getRowInfo(config.id)
                if (!rowInfo) return null

                return (
                  <tr
                    key={config.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-2 text-center">
                      <Input
                        type="number"
                        min="1"
                        value={config.customOrder ?? ""}
                        onChange={(e) => updateCustomOrder(config.id, e.target.value)}
                        className="h-8 w-20 text-center mx-auto"
                        placeholder="#"
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
