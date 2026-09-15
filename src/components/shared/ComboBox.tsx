import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { cn } from "@/lib/utils"

export type ComboBoxOption = { value: string; label: string }

type ComboBoxProps = {
  options: readonly ComboBoxOption[]
  value?: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  limit?: number
}

export const ComboBox = ({
  options,
  value = null,
  onChange,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  disabled = false,
  className,
  limit = 50,
}: ComboBoxProps) => {
  const items = options as ComboBoxOption[]
  const selected = items.find((option) => option.value === value) ?? null

  return (
    <Combobox
      items={items}
      value={selected}
      onValueChange={(option) => onChange(option?.value ?? null)}
      limit={limit}
    >
      <ComboboxInput
        placeholder={placeholder}
        disabled={disabled}
        showClear
        className={cn('rounded-none', className)}
      />
      <ComboboxContent>
        <ComboboxEmpty>{emptyMessage}</ComboboxEmpty>
        <ComboboxList>
          {(option: ComboBoxOption) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
        {items.length > limit && (
          <p className="border-t px-2 py-1.5 text-xs text-muted-foreground">
            Showing {limit} of {items.length.toLocaleString('en-IN')} — type to narrow
          </p>
        )}
      </ComboboxContent>
    </Combobox>
  )
}
