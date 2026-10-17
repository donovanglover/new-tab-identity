import clsx from 'clsx'

export interface CityButtonProps {
  children: React.ReactNode
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  tabIndex?: number
  title: string
}

export default function CityButton ({ children, onClick, className, tabIndex, title }: CityButtonProps): React.ReactElement {
  return (
    <button className={clsx('rounded-full bg-300 px-2 py-0.5 text-xs text-600 transition-colors hover:bg-400 focus:outline-none focus-visible:bg-400', className)} onClick={onClick} tabIndex={tabIndex} title={title}>{children}</button>
  )
}
