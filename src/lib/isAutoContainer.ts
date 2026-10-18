/** Whether a container name matches the format the addon generates.
 *
 * Names are generated as `"City, Country (hostname)"`, so any name without a
 * comma was renamed by the user or created outside the addon.
 *
 * @param name Container name to check.
 * @returns Whether the name looks like an auto-generated container name.
 */
export function isAutoContainer(name: string): boolean {
  return name.includes(',')
}
