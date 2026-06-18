import { cn } from "@/lib/utils"

export function Avatar({
  initials,
  src,
  className,
}: {
  initials?: string
  src?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-zinc-900 text-sm font-medium text-foreground",
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
