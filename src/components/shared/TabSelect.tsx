import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ComboBoxOption } from "@/components/shared/ComboBox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type TabSelectProps = {
  options: readonly ComboBoxOption[]
  value: string
  onChange: (value: string) => void
  className?: string
  label?: string
  disabled?: boolean
}

export const TabSelect = ({ options, value, onChange, className, label = "Select Investement Type", disabled = false }: TabSelectProps) => (
  <div className="flex flex-col gap-2 w-fit">
    <Label className="ml-1">{label}</Label>
    <Tabs value={value} onValueChange={(next) => onChange(next as string)} >
      <TabsList className={cn('bg-black gap-2', className)}>
        {options.map((option) => (
          <TabsTrigger key={option.value} value={option.value} disabled={disabled} className="px-4 py-2 rounded-none hover:text-foreground/60 dark:hover:text-muted-foreground data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground dark:data-active:border-transparent data-active:hover:text-primary-foreground dark:data-active:hover:text-primary-foreground">
            {option.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  </div>
)
