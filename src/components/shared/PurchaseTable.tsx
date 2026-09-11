import { format, parseISO } from 'date-fns'
import type { SeriesData } from '@/lib/backtest'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn, inr } from '@/lib/utils'

export const PurchaseTable = ({ data, className }: { data: SeriesData[]; className?: string }) => (
  <Table containerClassName={cn('overflow-y-auto', className)}>
      <TableHeader className="sticky top-0 z-10 [&_th]:bg-background">
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Units</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="font-mono tabular-nums">
        {data.map((row) => (
          <TableRow key={row.date}>
            <TableCell className="whitespace-nowrap">
              {format(parseISO(row.date), 'dd MMM yy')}
            </TableCell>
            <TableCell className="text-right">{inr(row.amount)}</TableCell>
            <TableCell className="text-right">{inr(row.close)}</TableCell>
            {/* derived, not stored -- both operands are on the row */}
            <TableCell className="text-right">{(row.amount / row.close).toFixed(3)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
  </Table>
)
