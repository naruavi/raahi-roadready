import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('animated mobility service home', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => cleanup())

  it('presents the RoadReady motion story and transport service context', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Sign in to demo' }))

    expect(
      screen.getByRole('button', {
        name: 'Open RoadReady animated one-visit journey',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Your mobility at a glance' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Vehicle services')).toBeInTheDocument()
    expect(screen.getByText('PUC & fitness')).toBeInTheDocument()
    expect(screen.getByText('Permit & tax')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'Open RoadReady animated one-visit journey',
      }),
    )
    expect(
      await screen.findByRole('heading', {
        name: 'One visit. Everything ready.',
      }),
    ).toBeInTheDocument()
  })
})
