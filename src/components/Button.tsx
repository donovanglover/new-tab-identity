import clsx from 'clsx'

export interface ButtonProps {
  children: React.ReactNode
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  title: string
}

export default function Button ({ children, onClick, className, title }: ButtonProps): React.ReactElement {
  return (
    <button className={clsx('rounded-md border-2 border-300 bg-200 px-2 py-1 shadow transition-colors hover:bg-300', className)} onClick={onClick} title={title}>{children}</button>
  )
}
