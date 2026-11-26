import type { RefObject } from 'react'
import { Search } from 'lucide-react'

interface SearchInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  /** Ref untuk shortcut "/" */
  inputRef?: RefObject<HTMLInputElement | null>
}

/** Input pencarian dengan ikon dan keycap "/" sebagai petunjuk shortcut. */
export function SearchInput({ label, value, onChange, placeholder, inputRef }: SearchInputProps) {
  return (
    <label className="field toolbar__search">
      <span>{label}</span>
      <span className="search">
        <Search size={16} strokeWidth={1.5} aria-hidden="true" />
        <input
          ref={inputRef}
          className="input"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <kbd className="kbd" title="Tekan / untuk fokus ke pencarian">
          /
        </kbd>
      </span>
    </label>
  )
}
