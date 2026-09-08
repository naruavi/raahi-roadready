import { cleanup, render, screen } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

async function signIn(user: UserEvent) {
  render(<App />)
  await user.click(screen.getByRole('button', { name: 'Sign in to demo' }))
  await screen.findByRole('heading', { name: /Road services/i })
}

describe('existing citizen journeys', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('signs in with the published demo credentials', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Welcome to Raahi' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toHaveValue('testuser')
    expect(screen.getByLabelText('Password')).toHaveValue('test123')

    await user.click(screen.getByRole('button', { name: 'Sign in to demo' }))

    expect(
      await screen.findByRole('heading', { name: /Road services/i }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: /Renew my licence/i }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: /Track an application/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Get documents/i }),
    ).toBeInTheDocument()
  })

  it('supports the fictional phone and one-time-code sign-in', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('tab', { name: 'Phone' }))
    await user.click(screen.getByRole('button', { name: 'Get demo code' }))

    expect(screen.getByText('Demo code ready')).toBeInTheDocument()
    await user.type(screen.getByLabelText('6-digit demo code'), '123456')
    await user.click(screen.getByRole('button', { name: 'Verify and sign in' }))

    expect(
      await screen.findByRole('heading', { name: /Road services/i }),
    ).toBeInTheDocument()
  })

  it(
    'completes renewal and opens the application tracker',
    async () => {
      const user = userEvent.setup()
      await signIn(user)

      await user.click(
        screen.getAllByRole('button', { name: /Renew my licence/i })[0],
      )
      await user.click(
        screen.getByRole('button', { name: 'Check eligibility' }),
      )
      expect(
        await screen.findByText('Eligible for standard renewal'),
      ).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Continue' }))
      await screen.findByRole('heading', {
        name: 'Your document checklist',
      })
      await user.click(
        screen.getByRole('checkbox', {
          name: /I have reviewed this checklist/i,
        }),
      )
      await user.click(screen.getByRole('button', { name: 'Continue' }))
      await screen.findByRole('heading', { name: 'Choose an appointment' })
      await user.click(screen.getByRole('button', { name: 'Continue' }))
      await screen.findByRole('heading', {
        name: 'Review before submitting',
      })
      await user.click(
        screen.getByRole('checkbox', {
          name: /fictional information above is correct/i,
        }),
      )
      await user.click(
        screen.getByRole('button', { name: 'Submit demo application' }),
      )

      expect(
        await screen.findByRole('heading', {
          name: 'Your appointment is confirmed.',
        }),
      ).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Track progress' }))
      expect(
        await screen.findByRole('heading', { name: 'Appointment booked' }),
      ).toBeInTheDocument()
    },
    10_000,
  )

  it('keeps generated documents available from the home page', async () => {
    const user = userEvent.setup()
    await signIn(user)

    await user.click(screen.getByRole('button', { name: /Get documents/i }))

    expect(
      await screen.findByRole('heading', { name: 'Everything in one place' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Renewal fee receipt')).toBeInTheDocument()
    expect(screen.getByText('Appointment slip')).toBeInTheDocument()
    expect(screen.getByText('Application summary')).toBeInTheDocument()
  })

  it('does not present an expired legacy appointment as upcoming', async () => {
    localStorage.setItem('raahi-authenticated', 'true')
    localStorage.setItem(
      'raahi-application',
      JSON.stringify({
        id: 'DL-RN-2026-OLD',
        submittedAt: '29 Aug 2026, 7:18 PM',
        appointmentDate: '31 Aug 2026',
        appointmentTime: '09:30 AM',
        centre: 'RTO Dwarka, Sector 10',
      }),
    )

    render(<App />)

    expect(
      await screen.findByRole('heading', { name: /Road services/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Appointment confirmed' }),
    ).not.toBeInTheDocument()
  })

  it('expires a current-version appointment after its scheduled day', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(
      new Date('2026-09-17T00:00:00+05:30').getTime(),
    )
    localStorage.setItem('raahi-authenticated', 'true')
    localStorage.setItem(
      'raahi-application',
      JSON.stringify({
        version: 2,
        id: 'DL-RN-2026-082941',
        submittedAt: '08 Sep 2026, 7:18 PM',
        appointmentDate: '14 Sep 2026',
        appointmentTime: '09:30 AM',
        centre: 'RTO Dwarka, Sector 10',
      }),
    )

    render(<App />)

    expect(
      screen.queryByRole('heading', { name: 'Appointment confirmed' }),
    ).not.toBeInTheDocument()
  })
})
