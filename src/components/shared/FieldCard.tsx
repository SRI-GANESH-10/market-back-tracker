export const FieldCard = ({ children , className}: { children: React.ReactNode , className?: string }) => (
  <div className={`border p-4 ${className || ''}`}>{children}</div>
)
