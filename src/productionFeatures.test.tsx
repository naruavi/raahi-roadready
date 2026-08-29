import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

async function openHome() {
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button', { name: 'Sign in to demo' }))
  await screen.findByRole('heading', { name: /Road services/i })
  return user
}

describe('production-shaped service journeys', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it(
    'completes a first-time driving licence application',
    async () => {
      const user = await openHome()

      await user.click(
        screen.getByRole('button', {
          name: /Apply for a new driving licence/i,
        }),
      )
      expect(
        await screen.findByRole('heading', {
          name: 'Apply for a new driving licence',
        }),
      ).toBeInTheDocument()

      await user.click(
        screen.getByRole('button', { name: 'Check eligibility' }),
      )
      expect(
        await screen.findByRole('heading', {
          name: 'Choose vehicle classes',
        }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: /Light motor vehicle/i }),
      ).toBeChecked()

      await user.click(screen.getByRole('button', { name: 'Continue' }))
      expect(
        await screen.findByRole('heading', {
          name: 'Documents for your application',
        }),
      ).toBeInTheDocument()
      await user.click(
        screen.getByRole('checkbox', {
          name: /I have reviewed the document requirements/i,
        }),
      )
      await user.click(screen.getByRole('button', { name: 'Continue' }))

      expect(
        await screen.findByRole('heading', {
          name: "Book your learner's test",
        }),
      ).toBeInTheDocument()
      await user.click(
        screen.getByRole('button', { name: 'Pay ₹350 and submit' }),
      )

      expect(
        await screen.findByRole('heading', {
          name: 'Application submitted',
        }),
      ).toBeInTheDocument()
      expect(screen.getByText('LL-2026-082941')).toBeInTheDocument()
    },
    10_000,
  )

  it('reschedules an appointment and exposes shareable map details', async () => {
    const user = await openHome()

    await user.click(
      screen.getByRole('button', { name: /Manage appointment/i }),
    )
    expect(
      await screen.findByRole('heading', {
        name: 'Manage your appointment',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByTitle('RTO location map'),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Change appointment' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Wednesday, 02 September' }),
    )
    await user.click(screen.getByRole('button', { name: '02:30 PM' }))
    await user.click(
      screen.getByRole('button', { name: 'Save new appointment' }),
    )

    expect(screen.getByText('Appointment updated')).toBeInTheDocument()
    expect(screen.getByText(/02 Sep 2026 · 02:30 PM/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Send location' }))
    expect(
      await screen.findByText('Location link ready to share'),
    ).toBeInTheDocument()
  })
})
