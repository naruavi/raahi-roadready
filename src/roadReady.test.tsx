import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('RoadReady one-visit pass', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('bundles an intent, resolves preflight issues, and creates a QR pass', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Sign in to demo' }))

    await user.click(
      screen.getByRole('button', { name: 'Create a RoadReady Pass' }),
    )
    expect(
      await screen.findByRole('heading', {
        name: 'One visit. Everything ready.',
      }),
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText('What do you need to get done?'),
    ).toHaveValue(
      'My licence expires next month and I moved to a new address. Check any challans before I visit.',
    )
    await user.click(
      screen.getByRole('button', { name: 'Build my one-visit plan' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Your combined journey' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Renew driving licence')).toBeInTheDocument()
    expect(screen.getByText('Update address')).toBeInTheDocument()
    expect(screen.getByText('Clear pending challan')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Run document pre-check' }),
    )
    expect(
      await screen.findByRole('heading', { name: 'Preflight found 1 issue' }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Resolve name mismatch' }),
    )

    expect(screen.getByText('Ready for one visit')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Generate RoadReady Pass' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Your RoadReady Pass' }),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('RoadReady verification QR code'),
    ).toBeInTheDocument()
    expect(screen.getByText('4 checks passed')).toBeInTheDocument()
    expect(
      screen.getByText('Only readiness status is shared'),
    ).toBeInTheDocument()
  })
})
