import clsx from 'clsx'

export interface ButtonProps {
  children: React.ReactNode
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  className?: string
  disabled?: boolean
  title: string
}

export default function Button({
  children,
  onClick,
  className,
  disabled,
  title,
}: ButtonProps): React.ReactElement {
  return (
    <button
      className={clsx(
        'rounded-md border-2 border-300 bg-200 p-2 shadow transition-colors hover:bg-300 focus:outline-none focus-visible:border-500 disabled:opacity-50',
        className,
      )}
      disabled={disabled}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  )
}
