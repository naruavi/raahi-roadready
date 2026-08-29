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

describe('high-value road service additions', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
  })

  it('finds and completes payment for a fictional eChallan', async () => {
    const user = await openHome()

    await user.click(screen.getByRole('button', { name: /Check eChallan/i }))
    expect(
      await screen.findByRole('heading', { name: 'Check an eChallan' }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText('Vehicle number')).toHaveValue('DL 3C AB 8421')
    expect(screen.getByLabelText('Last 4 chassis digits')).toHaveValue('4821')
    await user.click(screen.getByRole('button', { name: 'Search challans' }))

    expect(
      await screen.findByRole('heading', { name: '1 pending challan' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Red light violation')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Pay ₹1,000 (demo)' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Demo payment complete' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Download challan receipt' }),
    ).toBeInTheDocument()
  })

  it('finds RTOs by PIN code and selects a centre', async () => {
    const user = await openHome()

    await user.click(screen.getByRole('button', { name: /Find an RTO/i }))
    expect(
      await screen.findByRole('heading', { name: 'Find the right RTO' }),
    ).toBeInTheDocument()

    expect(screen.getByLabelText('PIN code')).toHaveValue('110075')
    await user.selectOptions(
      screen.getByLabelText('Service needed'),
      'Driving licence renewal',
    )
    await user.click(screen.getByRole('button', { name: 'Search centres' }))

    expect(await screen.findByText('RTO Dwarka, Sector 10')).toBeInTheDocument()
    expect(screen.getByText('2.4 km away')).toBeInTheDocument()
    await user.click(
      screen.getAllByRole('button', { name: 'Use this centre' })[0],
    )
    expect(screen.getByText('Selected for your renewal')).toBeInTheDocument()
  })
})
