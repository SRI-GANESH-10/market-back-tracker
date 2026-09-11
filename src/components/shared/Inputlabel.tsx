import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type InputLabelProps = {
    value: string | number
    onChange: (value: string | number) => void
    label: string
    type?: "text" | "number"
    nonNegative?: boolean
    /** Upper bound for number fields. Typing past it clamps rather than rejects. */
    max?: number
    placeholder?: string
    className?: string
    disabled?: boolean
    inputClassName?: string
}

export const InputLabel = ({ value, onChange, label, type = "text", nonNegative = false, placeholder, className, disabled=false, inputClassName, max }: InputLabelProps) => {
    return (
        <div className={cn('flex gap-2 flex-col w-full', inputClassName)}>
            <Label>{label}</Label>
            <Input
                type={type}
                inputMode={type === "number" ? "decimal" : undefined}
                min={type === "number" && nonNegative ? 0 : undefined}
                max={type === "number" ? max : undefined}
                value={value}
                onChange={(e) => {
                    const next = e.target.value
                    if (type !== "number" || next === "") return onChange(next)
                    const num = Number(next)
                    if (nonNegative && num < 0) return
                    // clamp rather than reject: the browser's max attribute is
                    // advisory, and a value above it would run and then be
                    // thrown away by readParams on the next load
                    onChange(max !== undefined ? Math.min(num, max) : num)
                }}
                placeholder={placeholder}
                className={cn('rounded-none', className)}
                disabled={disabled}
            />
        </div>
    )
}
