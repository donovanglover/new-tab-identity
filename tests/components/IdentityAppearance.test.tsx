import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import IdentityAppearance from '@/components/IdentityAppearance'
import { type IdentityAppearanceChange, type IdentityColorOption, type IdentityIconOption } from '@/lib/identityAppearance'

const colors: IdentityColorOption[] = [
  { color: 'blue', colorCode: '#37adff' },
  { color: 'turquoise', colorCode: '#00c79a' }
]

const icons: IdentityIconOption[] = [
  { icon: 'fingerprint', iconUrl: 'resource://usercontext-content/fingerprint.svg' },
  { icon: 'tree', iconUrl: 'resource://usercontext-content/tree.svg' }
]

const onChange = vi.fn<(change: IdentityAppearanceChange) => void>()

function renderAppearance (): void {
  render(
    <IdentityAppearance color='blue' icon='fingerprint' colorCode='#37adff' iconUrl='resource://usercontext-content/fingerprint.svg' colors={colors} icons={icons} onChange={onChange} />
  )
}

function openAppearance (): HTMLElement {
  fireEvent.click(screen.getByRole('button', { name: 'Change color and icon' }))

  return screen.getByRole('group', { name: 'Color and icon' })
}

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  onChange.mockReset()
  renderAppearance()
})

describe('IdentityAppearance', () => {
  it('should show the current color and icon as selected', () => {
    openAppearance()

    expect(screen.getByRole('button', { name: 'Blue' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Turquoise' }).getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByRole('button', { name: 'Fingerprint' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Tree' }).getAttribute('aria-pressed')).toBe('false')
  })

  it('should report color changes', () => {
    openAppearance()
    fireEvent.click(screen.getByRole('button', { name: 'Turquoise' }))

    expect(onChange).toHaveBeenCalledWith({ color: 'turquoise' })
  })

  it('should report icon changes', () => {
    openAppearance()
    fireEvent.click(screen.getByRole('button', { name: 'Tree' }))

    expect(onChange).toHaveBeenCalledWith({ icon: 'tree' })
  })

  it('should toggle when the trigger is clicked', () => {
    const trigger = screen.getByRole('button', { name: 'Change color and icon' })

    fireEvent.click(trigger)

    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(trigger)

    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('group', { name: 'Color and icon' })).toBeNull()
  })

  it('should close on Escape and return focus to the trigger', () => {
    const trigger = screen.getByRole('button', { name: 'Change color and icon' })
    const panel = openAppearance()

    fireEvent.keyDown(panel, { key: 'Escape' })

    expect(screen.queryByRole('group', { name: 'Color and icon' })).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('should stay open on other keys', () => {
    const panel = openAppearance()

    fireEvent.keyDown(panel, { key: 'Enter' })

    expect(screen.getByRole('group', { name: 'Color and icon' })).toBeDefined()
  })

  it('should do nothing on Escape while closed', () => {
    fireEvent.keyDown(screen.getByRole('button', { name: 'Change color and icon' }), { key: 'Escape' })

    expect(screen.queryByRole('group', { name: 'Color and icon' })).toBeNull()
  })

  it('should close when clicking outside', () => {
    openAppearance()
    fireEvent.pointerDown(document.body)

    expect(screen.queryByRole('group', { name: 'Color and icon' })).toBeNull()
  })

  it('should stay open when clicking inside', () => {
    const panel = openAppearance()

    fireEvent.pointerDown(panel)

    expect(screen.getByRole('group', { name: 'Color and icon' })).toBeDefined()
  })
})
