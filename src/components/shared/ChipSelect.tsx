import type { ComboBoxOption } from '@/components/shared/ComboBox'
import { cn } from '@/lib/utils'

type ChipSelectProps = {
  options: readonly ComboBoxOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  className?: string
  disabled?: boolean
}

export const ChipSelect = ({
  options,
  value,
  onChange,
  label,
  className,
  disabled = false,
}: ChipSelectProps) => (
  <div className={cn('flex flex-wrap items-center gap-2', disabled && 'opacity-50', className)}>
    {label && (
      <span className="text-[0.625rem] tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </span>
    )}
    {options.map((option) => {
      const selected = option.value === value
      return (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          aria-pressed={selected}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-full border font-medium transition-colors outline-none text-xs px-1.5 py-1',
            'focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed',
            selected
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground'
          )}
        >
          {option.label}
        </button>
      )
    })}
  </div>
)
