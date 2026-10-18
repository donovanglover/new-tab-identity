import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import type {
  IdentityAppearanceChange,
  IdentityColorOption,
  IdentityIconOption,
} from '@/lib/identityAppearance'
import { t } from '@/lib/i18n'

const colorKeys = new Map<string, string>([
  ['blue', 'colorBlue'],
  ['turquoise', 'colorTurquoise'],
  ['green', 'colorGreen'],
  ['yellow', 'colorYellow'],
  ['orange', 'colorOrange'],
  ['red', 'colorRed'],
  ['pink', 'colorPink'],
  ['purple', 'colorPurple'],
])

const iconKeys = new Map<string, string>([
  ['fingerprint', 'iconFingerprint'],
  ['briefcase', 'iconBriefcase'],
  ['dollar', 'iconDollar'],
  ['cart', 'iconCart'],
  ['circle', 'iconCircle'],
  ['gift', 'iconGift'],
  ['vacation', 'iconVacation'],
  ['food', 'iconFood'],
  ['fruit', 'iconFruit'],
  ['pet', 'iconPet'],
  ['tree', 'iconTree'],
  ['chill', 'iconChill'],
  ['fence', 'iconFence'],
])

export interface IdentityAppearanceProps {
  color: string
  icon: string
  colorCode: string
  iconUrl: string
  colors: IdentityColorOption[]
  icons: IdentityIconOption[]
  onChange: (change: IdentityAppearanceChange) => void
}

function iconStyle(iconUrl: string, colorCode: string): React.CSSProperties {
  return {
    backgroundColor: colorCode,
    maskImage: `url("${iconUrl}")`,
    maskPosition: 'center',
    maskRepeat: 'no-repeat',
    maskSize: 'contain',
  }
}

function label(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function optionLabel(value: string, keys: Map<string, string>): string {
  const key = keys.get(value)

  return key === undefined ? label(value) : t(key)
}

export default function IdentityAppearance({
  color,
  icon,
  colorCode,
  iconUrl,
  colors,
  icons,
  onChange,
}: IdentityAppearanceProps): React.ReactElement {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: PointerEvent): void {
      if (root.current !== null && !root.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [open])

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key !== 'Escape' || !open) {
      return
    }

    event.preventDefault()
    setOpen(false)
    trigger.current?.focus()
  }

  return (
    <div ref={root} className='relative shrink-0' onKeyDown={handleKeyDown}>
      <button
        ref={trigger}
        type='button'
        aria-expanded={open}
        aria-label={t('changeColorAndIcon')}
        className='flex h-9 w-9 items-center justify-center rounded-md border-2 border-300 bg-200 p-1.5 shadow transition-colors hover:bg-300 focus:outline-none focus-visible:border-500'
        title={t('changeColorAndIcon')}
        onClick={() => {
          setOpen((current) => !current)
        }}
      >
        <span aria-hidden='true' className='block h-4 w-4' style={iconStyle(iconUrl, colorCode)} />
      </button>

      {open && (
        <div
          role='group'
          aria-label={t('colorAndIcon')}
          className='absolute left-0 top-full z-20 mt-1 flex w-max flex-col gap-2 rounded-md border-2 border-300 bg-100 p-2 shadow-md'
        >
          <div>
            <p className='pb-1 text-xs text-600'>{t('color')}</p>

            <div className='flex flex-wrap gap-1'>
              {colors.map((option) => (
                <button
                  key={option.color}
                  type='button'
                  aria-label={optionLabel(option.color, colorKeys)}
                  aria-pressed={option.color === color}
                  title={optionLabel(option.color, colorKeys)}
                  className={clsx(
                    'h-6 w-6 rounded-full border-2 border-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-500',
                    option.color === color && 'ring-2 ring-500 ring-offset-2 ring-offset-100',
                  )}
                  style={{ backgroundColor: option.colorCode }}
                  onClick={() => {
                    onChange({ color: option.color })
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className='pb-1 text-xs text-600'>{t('icon')}</p>

            <div className='grid grid-cols-7 gap-1'>
              {icons.map((option) => (
                <button
                  key={option.icon}
                  type='button'
                  aria-label={optionLabel(option.icon, iconKeys)}
                  aria-pressed={option.icon === icon}
                  title={optionLabel(option.icon, iconKeys)}
                  className={clsx(
                    'flex h-7 w-7 items-center justify-center rounded-md border-2 border-300 bg-200 hover:bg-300 focus:outline-none focus-visible:border-500',
                    option.icon === icon && 'border-500',
                  )}
                  onClick={() => {
                    onChange({ icon: option.icon })
                  }}
                >
                  <span
                    aria-hidden='true'
                    className='block h-4 w-4'
                    style={iconStyle(option.iconUrl, colorCode)}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
