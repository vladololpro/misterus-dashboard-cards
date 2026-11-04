interface NoticeBannerProps {
  message: string
  variant?: 'error' | 'warning' | 'success'
  actionLabel?: string
  onAction?: () => void
  onClose?: () => void
  className?: string
}

function NoticeBanner({
  message,
  variant = 'error',
  actionLabel,
  onAction,
  onClose,
  className,
}: NoticeBannerProps) {
  const classes = ['notice-banner', `notice-banner--${variant}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} role={variant === 'success' ? 'status' : 'alert'}>
      <div className="notice-banner__content">
        <span className="notice-banner__icon">{variant === 'success' ? '✓' : '!'}</span>
        <p className="notice-banner__text">{message}</p>
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          className="notice-banner__action"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}

      {onClose && (
        <button
          type="button"
          className="notice-banner__close"
          onClick={onClose}
          aria-label="Закрыть уведомление"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default NoticeBanner
