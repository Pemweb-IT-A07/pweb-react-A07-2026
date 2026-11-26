interface ToastProps {
  message: string
  /** Label tombol aksi, misal "Undo". Tidak tampil jika onAction kosong. */
  actionLabel?: string
  onAction?: () => void
  onClose: () => void
  /** Durasi (ms) untuk progress bar visual. Timer sebenarnya diatur pemanggil. */
  duration?: number
}

/**
 * Toast di pojok bawah. Komponen ini hanya tampilan; kapan toast hilang
 * diatur oleh parent (misal timer Undo di useRef).
 */
export function Toast({ message, actionLabel, onAction, onClose, duration }: ToastProps) {
  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast__message">{message}</span>
      {onAction && (
        <button type="button" className="toast__action" onClick={onAction}>
          {actionLabel ?? 'OK'}
        </button>
      )}
      <button type="button" className="toast__close" aria-label="Tutup" onClick={onClose}>
        ×
      </button>
      {duration !== undefined && (
        <span className="toast__progress" style={{ animationDuration: `${duration}ms` }} />
      )}
    </div>
  )
}
