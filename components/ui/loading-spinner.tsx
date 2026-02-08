import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-primary/30 border-t-primary",
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LoadingPageProps {
  text?: string
}

export function LoadingPage({ text = "Loading" }: LoadingPageProps = {}) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <LoadingSpinner size="lg" className="h-14 w-14" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {text}
        </p>
      </div>
    </div>
  )
}
