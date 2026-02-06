"use client"

import { useState, useMemo } from "react"
import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthYear = useMemo(() => {
    return currentDate.toLocaleDateString('ms-MY', { month: 'long', year: 'numeric' })
  }, [currentDate])

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const days = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    
    return { days, firstDay, year, month }
  }, [currentDate])

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear()
  }

  const daysList = useMemo(() => {
    const list = []
    const { days, firstDay } = daysInMonth
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < firstDay; i++) {
      list.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= days; day++) {
      list.push(day)
    }
    
    return list
  }, [daysInMonth])

  const weekDays = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu']

  return (
    <PageLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex h-16 items-center gap-4 px-6">
          <SidebarTrigger className="h-9 w-9" />
          <div className="flex-1">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar
            </h1>
            <p className="text-sm text-muted-foreground">Kalendar bulanan</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
        <div className="rounded-xl border bg-card shadow-sm">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold capitalize">{monthYear}</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="text-sm"
              >
                Hari Ini
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousMonth}
                className="h-9 w-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextMonth}
                className="h-9 w-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {daysList.map((day, index) => (
                <div
                  key={index}
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200",
                    day === null && "invisible",
                    day !== null && !isToday(day) && "hover:bg-muted cursor-pointer",
                    day !== null && isToday(day) && "bg-primary text-primary-foreground shadow-md hover:shadow-lg"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
