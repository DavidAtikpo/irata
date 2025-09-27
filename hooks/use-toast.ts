type ToastVariant = 'default' | 'destructive'

type ToastOptions = {
  title?: string
  description?: string
  variant?: ToastVariant
}

export function toast(options: ToastOptions) {
  if (typeof window !== 'undefined') {
    // Minimal fallback toast for now
    const prefix = options.variant === 'destructive' ? '[Erreur]' : '[Info]'
    const msg = `${options.title ?? ''}${options.title && options.description ? ' - ' : ''}${options.description ?? ''}`.trim()
    // eslint-disable-next-line no-console
    console.log(`${prefix} ${msg}`)
  }
}

export function useToast() {
  return { toast }
}


