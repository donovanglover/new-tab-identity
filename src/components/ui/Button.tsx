import clsx from 'clsx'

export interface ButtonProps {
  children: React.ReactNode
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
}

export default function Button ({ children, onClick, className }: ButtonProps): React.ReactElement {
  return (
    <button className={clsx('rounded-md border-2 border-300 bg-200 px-4 py-2 shadow transition-colors hover:bg-300', className)} onClick={onClick}>{children}</button>
  )
}
