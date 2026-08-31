import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type InputLabelProps = {
    value: string | number
    onChange: (value: string | number) => void
    label: string
    type?: "text" | "number"
    nonNegative?: boolean
    placeholder?: string
    className?: string
}

export const InputLabel = ({ value, onChange, label, type = "text", nonNegative = false, placeholder, className }: InputLabelProps) => {
    return (
        <div className='flex gap-2 flex-col w-fit'>
            <Label>{label}</Label>
            <Input
                type={type}
                inputMode={type === "number" ? "decimal" : undefined}
                min={type === "number" && nonNegative ? 0 : undefined}
                value={value}
                onChange={(e) => {
                    const next = e.target.value
                    if (type !== "number" || next === "") return onChange(next)
                    const num = Number(next)
                    if (nonNegative && num < 0) return
                    onChange(num)
                }}
                placeholder={placeholder}
                className={cn('rounded-none', className)}
            />
        </div>
    )
}
