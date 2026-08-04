import { fetchPhilosophers } from '../src/api/philosophers/client.ts'

try {
  const philosophers = await fetchPhilosophers({ timeoutMs: 15_000 })
  const withKnownBirthYears = philosophers.filter(
    (philosopher) => philosopher.birthYear.numeric !== null,
  ).length

  console.log(
    `Philosophers API smoke passed: ${philosophers.length} records validated; ${withKnownBirthYears} normalized birth years.`,
  )
} catch (error) {
  console.error(
    error instanceof Error
      ? `Philosophers API smoke failed: ${error.message}`
      : 'Philosophers API smoke failed with an unknown error.',
  )
  process.exitCode = 1
}
