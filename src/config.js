export let requestDelay
export let cheerio
export let useFixtures

export async function setup (options) {
  requestDelay = options.requestDelay || 4000
  cheerio = options.cheerio
  useFixtures = options.useFixtures || false
}

export async function loadFixture (name) {
  const { [name]: html } = await import('race-fix')
  return html
}
