import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

export type ComboBoxOption = { value: string; label: string }

type ComboBoxProps = {
  options: readonly ComboBoxOption[]
  value?: string | null
  onChange: (value: string | null) => void
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
}

export const ComboBox = ({
  options,
  value = null,
  onChange,
  placeholder = "Select an option",
  emptyMessage = "No results found.",
  disabled = false,
  className,
}: ComboBoxProps) => {
  const items = options as ComboBoxOption[]
  const selected = items.find((option) => option.value === value) ?? null

  return (
    <Combobox
      items={items}
      value={selected}
      onValueChange={(option) => onChange(option?.value ?? null)}
    >
      <ComboboxInput
        placeholder={placeholder}
        disabled={disabled}
        showClear
        className={className}
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
      </ComboboxContent>
    </Combobox>
  )
}
