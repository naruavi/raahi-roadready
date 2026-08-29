import { type FormEvent, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Search,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'

type Translate = (english: string, hindi: string) => string

type RtoFinderViewProps = {
  t: Translate
  onBack: () => void
  onStartRenewal: () => void
  onSelectCentre: (centre: string) => void
}

const centres = [
  {
    name: 'RTO Dwarka, Sector 10',
    distance: '2.4 km away',
    hours: '8:30 AM – 4:30 PM',
    nextSlot: '31 Aug · 09:30 AM',
    crowd: 'Usually quieter before 11 AM',
    accessible: true,
    services: ['Driving licence renewal', 'Driving test', 'Address change'],
  },
  {
    name: 'RTO Janakpuri, District Centre',
    distance: '5.8 km away',
    hours: '9:00 AM – 5:00 PM',
    nextSlot: '01 Sep · 11:00 AM',
    crowd: 'Moderate wait expected',
    accessible: true,
    services: ['Driving licence renewal', 'Duplicate licence', 'Driving test'],
  },
  {
    name: 'RTO Vasant Vihar',
    distance: '8.1 km away',
    hours: '8:30 AM – 4:30 PM',
    nextSlot: '02 Sep · 10:15 AM',
    crowd: 'Usually quieter after 2 PM',
    accessible: false,
    services: ['Driving licence renewal', 'Vehicle transfer', 'Address change'],
  },
]

export function RtoFinderView({
  t,
  onBack,
  onStartRenewal,
  onSelectCentre,
}: RtoFinderViewProps) {
  const [pinCode, setPinCode] = useState('110075')
  const [service, setService] = useState('Driving licence renewal')
  const [searched, setSearched] = useState(false)
  const [selectedCentre, setSelectedCentre] = useState('')
  const [error, setError] = useState('')

  const searchCentres = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pinCode.replace(/\D/g, '').length !== 6) {
      setError(t('Enter a valid 6-digit PIN code.', 'मान्य 6 अंकों का पिन कोड दर्ज करें।'))
      return
    }
    setError('')
    setSearched(true)
  }

  const chooseCentre = (centre: string) => {
    setSelectedCentre(centre)
    onSelectCentre(centre)
  }

  return (
    <main id="main-content" className="inner-page service-tool-page">
      <div className="container wide-tool-container">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={18} aria-hidden="true" />
          {t('Back to services', 'सेवाओं पर वापस जाएँ')}
        </button>

        <div className="page-heading">
          <p className="overline">{t('Plan your visit', 'अपनी यात्रा की योजना बनाएँ')}</p>
          <h1>{t('Find the right RTO', 'सही RTO खोजें')}</h1>
          <p>
            {t(
              'Search by service—not office name—and compare distance, hours, accessibility and the next slot.',
              'कार्यालय के नाम के बजाय सेवा से खोजें और दूरी, समय, सुविधा व अगला स्लॉट देखें।',
            )}
          </p>
        </div>

        <section className="tool-card rto-tool-card">
          <form className="rto-search-form" onSubmit={searchCentres}>
            <label className="field">
              <span>{t('PIN code', 'पिन कोड')}</span>
              <div className="input-with-leading-icon">
                <MapPin size={18} aria-hidden="true" />
                <input
                  value={pinCode}
                  onChange={(event) => {
                    setPinCode(
                      event.target.value.replace(/\D/g, '').slice(0, 6),
                    )
                    setSearched(false)
                    setSelectedCentre('')
                  }}
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </div>
            </label>
            <label className="field">
              <span>{t('Service needed', 'आवश्यक सेवा')}</span>
              <select
                value={service}
                onChange={(event) => {
                  setService(event.target.value)
                  setSearched(false)
                  setSelectedCentre('')
                }}
              >
                <option>Driving licence renewal</option>
                <option>Driving test</option>
                <option>Duplicate licence</option>
                <option>Address change</option>
                <option>Vehicle transfer</option>
              </select>
            </label>
            <button className="button primary" type="submit">
              <Search size={18} aria-hidden="true" />
              {t('Search centres', 'केंद्र खोजें')}
            </button>
          </form>

          {error && <div className="error-message" role="alert">{error}</div>}

          {searched && (
            <div className="rto-results">
              <div className="rto-results-heading">
                <div>
                  <p className="overline">{t('Near PIN 110075', 'पिन 110075 के पास')}</p>
                  <h2>{t('3 centres found', '3 केंद्र मिले')}</h2>
                </div>
                <span>
                  {t(
                    `Filtered for ${service}`,
                    `${service} के लिए फ़िल्टर किया गया`,
                  )}
                </span>
              </div>

              <div className="rto-list">
                {centres.map((centre, index) => {
                  const selected = selectedCentre === centre.name
                  const serviceAvailable = centre.services.includes(service)
                  return (
                    <article
                      className={`rto-card ${selected ? 'selected' : ''}`}
                      key={centre.name}
                    >
                      <div className="rto-card-number">{index + 1}</div>
                      <div className="rto-card-content">
                        <div className="rto-card-title">
                          <div>
                            <h3>{centre.name}</h3>
                            <p>
                              <MapPin size={14} aria-hidden="true" />
                              {centre.distance}
                            </p>
                          </div>
                          {serviceAvailable ? (
                            <span className="available-pill">
                              <Check size={13} aria-hidden="true" />
                              {t('Service available', 'सेवा उपलब्ध')}
                            </span>
                          ) : (
                            <span className="pending-pill">
                              {t('Not available here', 'यहाँ उपलब्ध नहीं')}
                            </span>
                          )}
                        </div>
                        <div className="rto-facts">
                          <span>
                            <Clock3 size={15} aria-hidden="true" />
                            <b>{t('Hours', 'समय')}</b>
                            {centre.hours}
                          </span>
                          <span>
                            <CalendarDays size={15} aria-hidden="true" />
                            <b>{t('Next slot', 'अगला स्लॉट')}</b>
                            {centre.nextSlot}
                          </span>
                          <span>
                            <UsersRound size={15} aria-hidden="true" />
                            <b>{t('Expected crowd', 'अनुमानित भीड़')}</b>
                            {centre.crowd}
                          </span>
                          <span>
                            <ShieldCheck size={15} aria-hidden="true" />
                            <b>{t('Accessibility', 'सुगम्यता')}</b>
                            {centre.accessible
                              ? t('Wheelchair accessible', 'व्हीलचेयर अनुकूल')
                              : t('Call before visiting', 'जाने से पहले फ़ोन करें')}
                          </span>
                        </div>
                      </div>
                      <button
                        className={`button ${selected ? 'selected-button' : 'secondary'}`}
                        onClick={() => chooseCentre(centre.name)}
                        disabled={!serviceAvailable}
                      >
                        {selected ? (
                          <>
                            <Check size={17} aria-hidden="true" />
                            {t('Selected', 'चुना गया')}
                          </>
                        ) : (
                          t('Use this centre', 'यह केंद्र चुनें')
                        )}
                      </button>
                    </article>
                  )
                })}
              </div>

              {selectedCentre && (
                <div className="centre-selected-banner" role="status">
                  <span>
                    <Check size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>{t('Selected for your renewal', 'नवीनीकरण के लिए चुना गया')}</strong>
                    <p>{selectedCentre}</p>
                  </div>
                  <button className="button primary" onClick={onStartRenewal}>
                    {t('Continue to renewal', 'नवीनीकरण जारी रखें')}
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
