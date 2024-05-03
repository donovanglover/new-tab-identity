export async function fetchJSON (url: string): Promise<any> {
  const response = await fetch(url)
  const json = await response.json()

  return json
}
