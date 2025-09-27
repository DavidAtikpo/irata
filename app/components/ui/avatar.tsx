import * as React from "react"
import { cn } from "../../lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "relative inline-flex h-10 w-10 overflow-hidden rounded-full bg-gray-100",
        className
      )}
      {...props}
    />
  )
})
Avatar.displayName = "Avatar"

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(({ className, ...props }, ref) => {
  return <img ref={ref} className={cn("h-full w-full object-cover", className)} alt="" {...props} />
})
AvatarImage.displayName = "AvatarImage"

export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {}

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(({ className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center bg-gray-200 text-gray-600 text-sm font-medium",
        className
      )}
      {...props}
    />
  )
})
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }









