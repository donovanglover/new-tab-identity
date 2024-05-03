export class BrowserContainers {
  readonly #colors = ['blue', 'turquoise', 'green', 'yellow', 'orange', 'red', 'pink', 'purple']

  #numContainers: number = 0

  constructor () {
    void this.removeAll()
  }

  /** Remove all existing containers from the container list */
  async removeAll (): Promise<void> {
    const contexts = await browser.contextualIdentities.query({})

    for (const context of contexts) {
      await browser.contextualIdentities.remove(context.cookieStoreId)
    }
  }

  async add (location: string): Promise<void> {
    await browser.contextualIdentities.create({
      name: location,
      color: this.#colors[this.#numContainers++ % this.#colors.length],
      icon: 'circle'
    })
  }
}
