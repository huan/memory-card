// tslint:disable:no-console

import {
  MemoryCard,
  VERSION,
}               from 'memory-card'

async function main () {
  try {
    if (VERSION === '0.0.0') {
      throw new Error('version not set right before publish!')
    }

    const card = new MemoryCard()
    await card.load()

    await card.set('a', 'b')
    await card.get('a')
    console.info(`Smoke Testing v${card.version()} PASSED!`)
    return 0
  } catch (e) {
    console.error(e)
    return 1
  }
}

main()
  .then(process.exit)
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
