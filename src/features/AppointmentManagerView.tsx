import { useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  ExternalLink,
  MapPin,
  Navigation,
  Send,
  ShieldCheck,
} from 'lucide-react'

type Translate = (english: string, hindi: string) => string

export type AppointmentDetails = {
  date: string
  time: string
  centre: string
}

type AppointmentManagerViewProps = {
  t: Translate
  appointment: AppointmentDetails
  onBack: () => void
  onUpdate: (appointment: AppointmentDetails) => void
}

const dates = [
  { value: '31 Aug 2026', label: 'Monday, 31 August', day: '31', month: 'Aug' },
  { value: '01 Sep 2026', label: 'Tuesday, 01 September', day: '01', month: 'Sep' },
  { value: '02 Sep 2026', label: 'Wednesday, 02 September', day: '02', month: 'Sep' },
]

const mapUrl =
  'https://www.openstreetmap.org/export/embed.html?bbox=77.0472%2C28.5744%2C77.0680%2C28.5892&layer=mapnik&marker=28.5818%2C77.0576'
const directionsUrl =
  'https://www.openstreetmap.org/?mlat=28.5818&mlon=77.0576#map=16/28.5818/77.0576'

export function AppointmentManagerView({
  t,
  appointment,
  onBack,
  onUpdate,
}: AppointmentManagerViewProps) {
  const [editing, setEditing] = useState(false)
  const [selectedDate, setSelectedDate] = useState(appointment.date)
  const [selectedTime, setSelectedTime] = useState(appointment.time)
  const [status, setStatus] = useState('')

  const saveAppointment = () => {
    onUpdate({
      date: selectedDate,
      time: selectedTime,
      centre: appointment.centre,
    })
    setEditing(false)
    setStatus(t('Appointment updated', 'अपॉइंटमेंट अपडेट हुआ'))
  }

  const shareLocation = async () => {
    const shareData = {
      title: appointment.centre,
      text: `${appointment.centre} · ${appointment.date} · ${appointment.time}`,
      url: directionsUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          `${shareData.text}\n${shareData.url}`,
        )
      }
      setStatus(t('Location link ready to share', 'स्थान लिंक साझा करने के लिए तैयार है'))
    } catch {
      // Native sharing may be unavailable or dismissed; the visible map link remains usable.
      setStatus(t('Location link ready to share', 'स्थान लिंक साझा करने के लिए तैयार है'))
    }
  }

  return (
    <main id="main-content" className="inner-page appointment-page">
      <div className="container wide-tool-container">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={18} aria-hidden="true" />
          {t('Back to services', 'सेवाओं पर वापस जाएँ')}
        </button>

        <div className="page-heading">
          <p className="overline">{t('Visit planning', 'यात्रा योजना')}</p>
          <h1>{t('Manage your appointment', 'अपना अपॉइंटमेंट प्रबंधित करें')}</h1>
          <p>
            {t(
              'Review the visit, change the slot, send the location or open turn-by-turn directions.',
              'यात्रा देखें, स्लॉट बदलें, स्थान भेजें या दिशा-निर्देश खोलें।',
            )}
          </p>
        </div>

        <div className="appointment-manager-grid">
          <section className="tool-card appointment-details-card">
            <div className="appointment-card-heading">
              <span>
                <CalendarDays size={22} aria-hidden="true" />
              </span>
              <div>
                <p className="overline">{t('Current booking', 'वर्तमान बुकिंग')}</p>
                <h2>{appointment.centre}</h2>
              </div>
            </div>

            {!editing ? (
              <>
                <div className="appointment-summary-grid">
                  <div>
                    <CalendarDays size={18} aria-hidden="true" />
                    <span>{t('Date', 'तारीख')}</span>
                    <strong>{appointment.date}</strong>
                  </div>
                  <div>
                    <Clock3 size={18} aria-hidden="true" />
                    <span>{t('Time', 'समय')}</span>
                    <strong>{appointment.time}</strong>
                  </div>
                  <div>
                    <MapPin size={18} aria-hidden="true" />
                    <span>{t('Address', 'पता')}</span>
                    <strong>Sector 10, Dwarka, New Delhi 110075</strong>
                  </div>
                </div>
                <div className="visit-checklist">
                  <p className="overline">{t('Before you leave', 'जाने से पहले')}</p>
                  {[
                    t('Carry your appointment slip', 'अपॉइंटमेंट स्लिप साथ रखें'),
                    t('Bring the original licence and required documents', 'मूल लाइसेंस और आवश्यक दस्तावेज़ लाएँ'),
                    t('Arrive 10 minutes before the slot', 'स्लॉट से 10 मिनट पहले पहुँचें'),
                  ].map((item) => (
                    <span key={item}>
                      <Check size={14} aria-hidden="true" />
                      {item}
                    </span>
                  ))}
                </div>
                <button
                  className="button primary appointment-change-button"
                  onClick={() => {
                    setEditing(true)
                    setStatus('')
                  }}
                >
                  {t('Change appointment', 'अपॉइंटमेंट बदलें')}
                </button>
              </>
            ) : (
              <div className="appointment-editor">
                <div className="selection-group">
                  <label>{t('Choose a new date', 'नई तारीख चुनें')}</label>
                  <div className="date-options">
                    {dates.map((date) => (
                      <button
                        key={date.value}
                        type="button"
                        aria-label={date.label}
                        className={selectedDate === date.value ? 'selected' : ''}
                        onClick={() => setSelectedDate(date.value)}
                      >
                        <strong>{date.day}</strong>
                        <small>{date.month}</small>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="selection-group">
                  <label>{t('Choose a new time', 'नया समय चुनें')}</label>
                  <div className="slot-options">
                    {['09:30 AM', '11:00 AM', '02:30 PM'].map((time) => (
                      <button
                        key={time}
                        type="button"
                        className={selectedTime === time ? 'selected' : ''}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="editor-actions">
                  <button className="button secondary" onClick={() => setEditing(false)}>
                    {t('Cancel', 'रद्द करें')}
                  </button>
                  <button className="button primary" onClick={saveAppointment}>
                    {t('Save new appointment', 'नया अपॉइंटमेंट सहेजें')}
                  </button>
                </div>
              </div>
            )}

            {status && (
              <div className="inline-status" role="status">
                <Check size={16} aria-hidden="true" />
                <div>
                  <strong>{status}</strong>
                  {status === t('Appointment updated', 'अपॉइंटमेंट अपडेट हुआ') && (
                    <span>
                      {appointment.date} · {appointment.time}
                    </span>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="location-card">
            <div className="location-card-heading">
              <div>
                <p className="overline">{t('Location', 'स्थान')}</p>
                <h2>{t('Check the place before visiting', 'जाने से पहले स्थान देखें')}</h2>
              </div>
              <Navigation size={22} aria-hidden="true" />
            </div>
            <div className="map-frame">
              <iframe
                title="RTO location map"
                src={mapUrl}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="map-address">
              <MapPin size={18} aria-hidden="true" />
              <div>
                <strong>{appointment.centre}</strong>
                <span>Sector 10, Dwarka, New Delhi 110075</span>
              </div>
            </div>
            <div className="map-actions">
              <button className="button secondary" onClick={shareLocation}>
                <Send size={17} aria-hidden="true" />
                {t('Send location', 'स्थान भेजें')}
              </button>
              <a
                className="button primary"
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={17} aria-hidden="true" />
                {t('Open full map', 'पूरा नक्शा खोलें')}
              </a>
            </div>
            <p className="map-provider-note">
              <ShieldCheck size={15} aria-hidden="true" />
              {t(
                'Map data from OpenStreetMap. Confirm official centre details before travel.',
                'नक्शा OpenStreetMap से है। यात्रा से पहले आधिकारिक केंद्र विवरण की पुष्टि करें।',
              )}
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
