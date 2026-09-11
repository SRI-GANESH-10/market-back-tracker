import { useState } from 'react'
import { Check, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type NavBarProps = {
  shareUrl?: string
  children?: React.ReactNode
}

export const NavBar = ({ shareUrl, children }: NavBarProps) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="sticky top-0 z-30 -mx-4 -mt-4 flex flex-wrap items-center justify-between gap-4 border-b bg-background px-4 pt-4 pb-3 sm:-mx-8 sm:-mt-8 sm:px-8 sm:pt-8">
      <div className='flex gap-2 items-center'>
        <div className='h-2 w-2 bg-primary rounded-full'></div>
        <p className="font-semibold">Market Back Tracker</p>
      </div>

      <div className="flex items-center gap-2">
        {children}
        {shareUrl ? (
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check /> : <Link2 />}
            {copied ? 'Copied' : 'Share'}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
