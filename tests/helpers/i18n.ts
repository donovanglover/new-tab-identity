import { vi } from 'vitest'
import en from '@/public/_locales/en/messages.json'

const messages = new Map(
  Object.entries(en).map(([key, entry]) => [key, entry.message]),
)

/** Stub browser.i18n with the English catalog for tests that render localized text. */
export function stubEnglishI18n(): void {
  vi.stubGlobal('browser', {
    i18n: {
      getUILanguage: (): string => 'en-US',
      getMessage: (key: string, substitutions?: string[]): string => {
        const message = messages.get(key)

        if (message === undefined) {
          return ''
        }

        if (substitutions === undefined) {
          return message
        }

        return message.replace(
          /\$(\d+)/g,
          (_, index: string) => substitutions[Number(index) - 1] ?? '',
        )
      },
    },
  })
}
