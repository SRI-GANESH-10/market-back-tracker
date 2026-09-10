import { useState } from 'react'
import { Check, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const NavBar = ({ shareUrl }: { shareUrl?: string }) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-primary font-semibold">Market Back Tracker</p>
        <p className="text-xs text-muted-foreground">
          Replay a lumpsum or SIP against 19 years of Indian index data
        </p>
      </div>

      {shareUrl ? (
        <Button variant="outline" size="sm" onClick={copy}>
          {copied ? <Check /> : <Link2 />}
          {copied ? 'Copied' : 'Share'}
        </Button>
      ) : null}
    </div>
  )
}
