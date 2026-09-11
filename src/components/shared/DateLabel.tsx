import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type DateLabelProps = {
    date?: Date
    onChange: (date: Date | undefined) => void
    className?: string
    label?: string
    /** Earliest selectable month — Jan 2009, as far back as Yahoo serves these ETFs. */
    startMonth?: Date
    endMonth?: Date
}

export const DateLabel = ({ date, onChange, className, label = "Select Date", startMonth = new Date(2009, 0), endMonth = new Date() }: DateLabelProps) => {
    const [open, setOpen] = useState(false)

    return (
        <div className="flex gap-2 flex-col w-full sm:w-fit">
            <Label>{label}</Label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                    render={
                        <Button
                            variant="outline"
                            className={cn("w-56 justify-start font-normal", !date && "text-muted-foreground", className)}
                        >
                            <CalendarIcon />
                            {date ? format(date, "dd MMM yyyy") : "Pick a date"}
                        </Button>
                    }
                />
                <PopoverContent className="w-(--anchor-width) p-0" align="start">
                    <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        startMonth={startMonth}
                        endMonth={endMonth}
                        disabled={{ before: startMonth, after: endMonth }}
                        selected={date}
                        defaultMonth={date}
                        onSelect={(next) => {
                            if (!next) return
                            onChange(next)
                            setOpen(false)
                        }}
                        className="w-full"
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
