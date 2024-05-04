import { describe, expect, it } from 'vitest'
import { fetchJSON } from '../src/lib/fetchJSON'
import { MULLVAD_PUBLIC_API_URL } from '../src/lib/globals'

describe('fetchJSON()', () => {
  it('should fetch the mullvad api successfully without authentication', async () => {
    expect(await fetchJSON(MULLVAD_PUBLIC_API_URL)).toBeDefined()
  })
})
