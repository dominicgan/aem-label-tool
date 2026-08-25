import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alert"
      className={cn(
        'relative w-full rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800',
        className
      )}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />
  )
}

function AlertDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm opacity-90', className)} {...props} />
}

export { Alert, AlertDescription, AlertTitle }
