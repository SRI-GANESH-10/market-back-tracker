import { Button } from '@/components/ui/button'

export const BackTester = () => {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold tracking-tight text-primary">Back Tester</h1>
      <div className="rounded-lg border border-primary bg-primary/10 p-4">
        primary token check
      </div>
      <Button>Run backtest</Button>
    </div>
  )
}
