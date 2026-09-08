export const demoAppointmentDates = [
  {
    value: '14 Sep 2026',
    label: 'Monday, 14 September',
    day: '14',
    weekday: 'Mon',
    month: 'Sep',
  },
  {
    value: '15 Sep 2026',
    label: 'Tuesday, 15 September',
    day: '15',
    weekday: 'Tue',
    month: 'Sep',
  },
  {
    value: '16 Sep 2026',
    label: 'Wednesday, 16 September',
    day: '16',
    weekday: 'Wed',
    month: 'Sep',
  },
] as const

const appointmentExpiry = new Map<string, number>(
  demoAppointmentDates.map((date) => [
    date.value,
    Date.parse(`2026-09-${date.day}T20:30:00+05:30`),
  ]),
)

export const getAppointmentExpiry = (date: string) =>
  appointmentExpiry.get(date) ?? 0

export const getAppointmentExpiryIso = (date: string) => {
  const expiry = getAppointmentExpiry(date)
  return expiry ? new Date(expiry).toISOString() : ''
}
