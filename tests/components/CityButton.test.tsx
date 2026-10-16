import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import CityButton from '@/components/CityButton'

describe('CityButton', () => {
  beforeEach(() => {
    render(
      <CityButton onClick={() => {}} title='Test'>Test</CityButton>
    )
  })

  it('should render', () => {
    expect(screen.getByText(/Test/)).toBeDefined()
  })
})
