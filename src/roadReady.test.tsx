import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('RoadReady one-visit pass', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
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
      screen.getByRole('button', { name: 'Simulate my RTO visit' }),
    )
    expect(
      await screen.findByRole('heading', {
        name: 'Your visit would stop at counter 2',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Second visit likely')).toBeInTheDocument()
    expect(
      screen.getByText('Name mismatch would stop the application'),
    ).toBeInTheDocument()
    expect(screen.getByText('If the citizen travelled now')).toBeInTheDocument()
    expect(screen.getByText('11 days')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Resolve name mismatch' }),
    )

    expect(screen.getByText('Your one-visit route is clear')).toBeInTheDocument()
    expect(screen.getByText('Successful visit replay')).toHaveFocus()
    expect(screen.getByText('4 counters clear')).toBeInTheDocument()
    expect(screen.getByText('Visit cost prevented')).toBeInTheDocument()
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
    expect(screen.getByText('Verified by VisitTwin')).toBeInTheDocument()
    expect(screen.getByText('1 day + 1 trip saved')).toBeInTheDocument()
  })

  it('simulates only the services requested and ignores legacy pass markers', async () => {
    localStorage.setItem('raahi-authenticated', 'true')
    localStorage.setItem('raahi-roadready-pass', 'issued')
    const user = userEvent.setup()
    render(<App />)

    await user.click(
      screen.getByRole('button', { name: 'Create a RoadReady Pass' }),
    )
    expect(
      await screen.findByRole('heading', {
        name: 'One visit. Everything ready.',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Your RoadReady Pass' }),
    ).not.toBeInTheDocument()

    const intent = screen.getByLabelText('What do you need to get done?')
    await user.clear(intent)
    await user.type(intent, 'Renew my licence')
    await user.click(
      screen.getByRole('button', { name: 'Build my one-visit plan' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Simulate my RTO visit' }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'Your one-visit route is clear',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Name mismatch would stop the application'),
    ).not.toBeInTheDocument()
    expect(screen.getByText('2 counters clear')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Generate RoadReady Pass' }),
    )
    expect(screen.getByText('3 checks passed')).toBeInTheDocument()
    expect(screen.getByText('1 service bundled · 1 visit planned')).toBeInTheDocument()
    expect(screen.getByText('Route verified')).toBeInTheDocument()
  })

  it('does not restore an expired VisitTwin pass', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-09-15T00:00:00+05:30').getTime(),
    )
    localStorage.setItem('raahi-authenticated', 'true')
    localStorage.setItem(
      'raahi-roadready-pass',
      JSON.stringify({
        version: 2,
        passId: 'RR-0908-41',
        intent:
          'My licence expires next month and I moved to a new address. Check any challans before I visit.',
        services: ['renew', 'address', 'challan'],
        centre: 'RTO Vasant Vihar',
        appointmentDate: '14 Sep 2026',
        expiresAt: '2026-09-14T20:30:00+05:30',
        visitTwinVerified: true,
        preventedFailure: true,
      }),
    )

    const user = userEvent.setup()
    render(<App />)
    await user.click(
      screen.getByRole('button', { name: 'Create a RoadReady Pass' }),
    )

    expect(
      await screen.findByRole('heading', {
        name: 'One visit. Everything ready.',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Your RoadReady Pass' }),
    ).not.toBeInTheDocument()
  })

  it('restores the RTO that was verified with the pass', async () => {
    localStorage.setItem('raahi-authenticated', 'true')
    localStorage.setItem(
      'raahi-roadready-pass',
      JSON.stringify({
        version: 2,
        passId: 'RR-0908-41',
        intent:
          'My licence expires next month and I moved to a new address. Check any challans before I visit.',
        services: ['renew', 'address', 'challan'],
        centre: 'RTO Vasant Vihar',
        appointmentDate: '16 Sep 2026',
        expiresAt: '2026-09-16T20:30:00+05:30',
        visitTwinVerified: true,
        preventedFailure: true,
      }),
    )

    const user = userEvent.setup()
    render(<App />)
    await user.click(
      screen.getByRole('button', { name: 'Create a RoadReady Pass' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Your RoadReady Pass' }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByText('RTO Vasant Vihar').length,
    ).toBeGreaterThan(0)

    await user.click(
      screen.getByRole('button', { name: /Manage visit and map/i }),
    )
    expect(
      await screen.findByRole('heading', {
        name: 'Manage your appointment',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'RTO Vasant Vihar',
      }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Vasant Vihar, New Delhi 110057').length).toBeGreaterThan(0)
    expect(screen.getByText('16 Sep 2026')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Change appointment' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Tuesday, 15 September' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Save new appointment' }),
    )

    const updatedPass = JSON.parse(
      localStorage.getItem('raahi-roadready-pass') ?? '{}',
    ) as { appointmentDate?: string; expiresAt?: string }
    expect(updatedPass.appointmentDate).toBe('15 Sep 2026')
    expect(updatedPass.expiresAt).toBe('2026-09-15T15:00:00.000Z')
  })
})
