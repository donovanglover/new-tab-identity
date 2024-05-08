import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import Button from '@/components/Button'

describe('Button', () => {
  beforeEach(() => {
    render(
      <Button onClick={() => {}} title='Test'>Test</Button>
    )
  })

  it('should render', () => {
    expect(screen.getByText(/Test/)).toBeDefined()
  })
})
