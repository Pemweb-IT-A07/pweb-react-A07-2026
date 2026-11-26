import type { ApplicationStatus } from '../types'
import { STATUS_LABEL } from '../utils'

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return <span className={`status status--${status.toLowerCase()}`}>{STATUS_LABEL[status]}</span>
}
