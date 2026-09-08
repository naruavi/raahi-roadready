import { type FormEvent, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  EyeOff,
  FileCheck2,
  FileText,
  Gauge,
  Home,
  Info,
  KeyRound,
  Languages,
  LockKeyhole,
  LogOut,
  MapPin,
  ReceiptText,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRound,
  WalletCards,
  Wifi,
} from 'lucide-react'
import './App.css'
import { MobilityHeroScene } from './components/MobilityHeroScene'
import { TransportServiceHub } from './components/TransportServiceHub'
import {
  demoAppointmentDates,
  getAppointmentExpiry,
  getAppointmentExpiryIso,
} from './demoSchedule'
import {
  AppointmentManagerView,
  type AppointmentDetails,
} from './features/AppointmentManagerView'
import { ChallanView } from './features/ChallanView'
import { NewLicenceView } from './features/NewLicenceView'
import { RoadReadyView } from './features/RoadReadyView'
import { RtoFinderView } from './features/RtoFinderView'

type View =
  | 'home'
  | 'renew'
  | 'track'
  | 'documents'
  | 'challan'
  | 'rto'
  | 'new-licence'
  | 'appointment'
  | 'road-ready'
type Language = 'en' | 'hi'

type RenewalForm = {
  licenceNumber: string
  dateOfBirth: string
  state: string
  phone: string
  addressChanged: boolean
  address: string
}

type Application = {
  version: 2
  id: string
  submittedAt: string
  appointmentDate: string
  appointmentTime: string
  centre: string
}

const APPLICATION_ID = 'DL-RN-2026-082941'

const initialForm: RenewalForm = {
  licenceNumber: 'DL-0420110149646',
  dateOfBirth: '1992-08-14',
  state: 'Delhi',
  phone: '98765 43210',
  addressChanged: false,
  address: 'Sector 12, Dwarka, New Delhi – 110075',
}

const appointmentSlots = ['09:30 AM', '11:00 AM', '02:30 PM']
const APPLICATION_STORAGE_VERSION = 2 as const
const currentAppointmentDates = new Set<string>(
  demoAppointmentDates.map((date) => date.value),
)
const showLegacyServicePanel = false

const readStoredApplication = (): Application | null => {
  try {
    const stored = localStorage.getItem('raahi-application')
    if (!stored) return null

    const application = JSON.parse(stored) as Partial<Application>
    return application.version === APPLICATION_STORAGE_VERSION &&
      typeof application.appointmentDate === 'string' &&
      currentAppointmentDates.has(application.appointmentDate) &&
      getAppointmentExpiry(application.appointmentDate) > Date.now()
      ? (application as Application)
      : null
  } catch {
    return null
  }
}

function App() {
  const [view, setView] = useState<View>('home')
  const [language, setLanguage] = useState<Language>('en')
  const [authenticated, setAuthenticated] = useState(
    () => localStorage.getItem('raahi-authenticated') === 'true',
  )
  const [authMode, setAuthMode] = useState<'credentials' | 'phone'>(
    'credentials',
  )
  const [username, setUsername] = useState('testuser')
  const [password, setPassword] = useState('test123')
  const [showPassword, setShowPassword] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('99999 00000')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [authError, setAuthError] = useState('')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<RenewalForm>(initialForm)
  const [documentsConfirmed, setDocumentsConfirmed] = useState(false)
  const [selectedDate, setSelectedDate] = useState('14 Sep 2026')
  const [selectedSlot, setSelectedSlot] = useState('09:30 AM')
  const [selectedCentre, setSelectedCentre] = useState(
    'RTO Dwarka, Sector 10',
  )
  const [appointmentOverride, setAppointmentOverride] =
    useState<AppointmentDetails | null>(null)
  const [rtoReturnView, setRtoReturnView] = useState<'renew' | 'new-licence'>(
    'renew',
  )
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [trackingQuery, setTrackingQuery] = useState(APPLICATION_ID)
  const [trackingVisible, setTrackingVisible] = useState(true)
  const [application, setApplication] = useState<Application | null>(
    readStoredApplication,
  )

  const t = (english: string, hindi: string) =>
    language === 'en' ? english : hindi

  const age = useMemo(() => {
    const birth = new Date(form.dateOfBirth)
    const today = new Date('2026-09-08')
    let result = today.getFullYear() - birth.getFullYear()
    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() < birth.getDate())
    ) {
      result -= 1
    }
    return result
  }, [form.dateOfBirth])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [view, step])

  const completeSignIn = () => {
    localStorage.setItem('raahi-authenticated', 'true')
    setAuthenticated(true)
    setAuthError('')
    setView('home')
  }

  const signInWithCredentials = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (username.trim() === 'testuser' && password === 'test123') {
      completeSignIn()
      return
    }
    setAuthError(
      t(
        'Those demo credentials do not match. Use testuser and test123.',
        'डेमो विवरण मेल नहीं खाते। testuser और test123 का उपयोग करें।',
      ),
    )
  }

  const requestDemoCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (phoneNumber.replace(/\D/g, '').length !== 10) {
      setAuthError(
        t(
          'Enter the 10-digit fictional phone number shown below.',
          'नीचे दिया 10 अंकों का काल्पनिक फ़ोन नंबर दर्ज करें।',
        ),
      )
      return
    }
    setOtpSent(true)
    setAuthError('')
  }

  const verifyDemoCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (otp === '123456') {
      completeSignIn()
      return
    }
    setAuthError(
      t(
        'That code is not correct. Use the demo code 123456.',
        'यह कोड सही नहीं है। डेमो कोड 123456 का उपयोग करें।',
      ),
    )
  }

  const signOut = () => {
    localStorage.removeItem('raahi-authenticated')
    setAuthenticated(false)
    setOtpSent(false)
    setOtp('')
    setAuthError('')
    setView('home')
  }

  const navigate = (nextView: View) => {
    setError('')
    if (nextView !== 'appointment') {
      setAppointmentOverride(null)
    }
    setView(nextView)
    if (nextView === 'renew' && step === 6) {
      setStep(1)
    }
  }

  const updateForm = (
    field: keyof RenewalForm,
    value: string | boolean,
  ) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const continueRenewal = () => {
    if (
      step === 1 &&
      (!form.licenceNumber.trim() || !form.dateOfBirth || !form.state)
    ) {
      setError(
        t(
          'Complete all three details to check your licence.',
          'अपने लाइसेंस की जाँच के लिए तीनों विवरण भरें।',
        ),
      )
      return
    }

    if (step === 2 && form.addressChanged && !form.address.trim()) {
      setError(
        t(
          'Add your current residential address.',
          'अपना वर्तमान आवासीय पता जोड़ें।',
        ),
      )
      return
    }

    if (step === 3 && !documentsConfirmed) {
      setError(
        t(
          'Confirm the document checklist before continuing.',
          'आगे बढ़ने से पहले दस्तावेज़ सूची की पुष्टि करें।',
        ),
      )
      return
    }

    setError('')
    setLoading(true)
    window.setTimeout(() => {
      setStep((current) => current + 1)
      setLoading(false)
    }, step === 1 ? 650 : 250)
  }

  const submitApplication = () => {
    if (!consent) {
      setError(
        t(
          'Confirm that the fictional details are correct.',
          'पुष्टि करें कि काल्पनिक विवरण सही हैं।',
        ),
      )
      return
    }

    setError('')
    setLoading(true)
    window.setTimeout(() => {
      const submitted: Application = {
        version: APPLICATION_STORAGE_VERSION,
        id: APPLICATION_ID,
        submittedAt: '08 Sep 2026, 7:18 PM',
        appointmentDate: selectedDate,
        appointmentTime: selectedSlot,
        centre: selectedCentre,
      }
      localStorage.setItem('raahi-application', JSON.stringify(submitted))
      setApplication(submitted)
      setStep(6)
      setLoading(false)
    }, 900)
  }

  const startFresh = () => {
    setForm(initialForm)
    setDocumentsConfirmed(false)
    setConsent(false)
    setSelectedDate('14 Sep 2026')
    setSelectedSlot('09:30 AM')
    setStep(1)
    setView('renew')
  }

  const downloadDocument = (title: string) => {
    const content = [
      'RAAHI — INDEPENDENT HACKATHON PROTOTYPE',
      'This document contains fictional demonstration data.',
      '',
      title.toUpperCase(),
      `Application: ${application?.id ?? APPLICATION_ID}`,
      `Licence: ${form.licenceNumber}`,
      'Applicant: Aarav Mehta (fictional)',
      `Appointment: ${application?.appointmentDate ?? selectedDate}, ${
        application?.appointmentTime ?? selectedSlot
      }`,
      `Centre: ${application?.centre ?? selectedCentre}`,
      'Amount: ₹600 (mock payment)',
      '',
      'Not issued by or affiliated with any government body.',
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${title.toLowerCase().replaceAll(' ', '-')}.txt`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const downloadChallanReceipt = () => {
    const content = [
      'RAAHI — INDEPENDENT HACKATHON PROTOTYPE',
      'This receipt contains fictional demonstration data.',
      '',
      'ECHALLAN PAYMENT RECEIPT',
      'Vehicle: DL 3C AB 8421',
      'Challan: DL-TRF-2026-18429',
      'Violation: Red light violation',
      'Amount: ₹1,000 (mock payment)',
      'Payment reference: RAH-82941',
      'Status: Paid in demo',
      '',
      'No bank, UPI, police or government service was contacted.',
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'demo-echallan-receipt.txt'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const updateAppointment = (updated: AppointmentDetails) => {
    setSelectedDate(updated.date)
    setSelectedSlot(updated.time)
    setSelectedCentre(updated.centre)

    const nextApplication: Application = {
      version: APPLICATION_STORAGE_VERSION,
      id: application?.id ?? APPLICATION_ID,
      submittedAt: application?.submittedAt ?? '08 Sep 2026, 7:18 PM',
      appointmentDate: updated.date,
      appointmentTime: updated.time,
      centre: updated.centre,
    }
    localStorage.setItem(
      'raahi-application',
      JSON.stringify(nextApplication),
    )
    const storedPass = localStorage.getItem('raahi-roadready-pass')
    if (storedPass) {
      try {
        const pass = JSON.parse(storedPass) as Record<string, unknown>
        if (pass.version === 2 && pass.centre === updated.centre) {
          localStorage.setItem(
            'raahi-roadready-pass',
            JSON.stringify({
              ...pass,
              appointmentDate: updated.date,
              expiresAt: getAppointmentExpiryIso(updated.date),
            }),
          )
        }
      } catch {
        localStorage.removeItem('raahi-roadready-pass')
      }
    }
    setApplication(nextApplication)
    setAppointmentOverride(updated)
  }

  const steps = [
    t('Licence', 'लाइसेंस'),
    t('Eligibility', 'पात्रता'),
    t('Documents', 'दस्तावेज़'),
    t('Appointment', 'अपॉइंटमेंट'),
    t('Review', 'समीक्षा'),
  ]

  const renderLogin = () => (
    <div className="login-shell">
      <a className="skip-link" href="#login-content">
        {t('Skip to sign in', 'साइन इन पर जाएँ')}
      </a>
      <div className="prototype-banner">
        <span className="prototype-dot" />
        {t(
          'Independent hackathon prototype · Use demo credentials only · No government connection',
          'स्वतंत्र हैकाथॉन प्रोटोटाइप · केवल डेमो विवरण उपयोग करें · कोई सरकारी संबंध नहीं',
        )}
      </div>
      <header className="login-header">
        <div className="container header-inner">
          <div className="brand static-brand">
            <span className="brand-mark" aria-hidden="true">
              र
            </span>
            <span>
              <strong>Raahi</strong>
              <small>
                {t(
                  'Road Transport Citizen Services',
                  'सड़क परिवहन नागरिक सेवा',
                )}
              </small>
            </span>
          </div>
          <div className="language-control dark-control" aria-label="Choose language">
            <Languages size={17} aria-hidden="true" />
            <button
              className={language === 'en' ? 'active' : ''}
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
            >
              EN
            </button>
            <span aria-hidden="true">/</span>
            <button
              className={language === 'hi' ? 'active' : ''}
              onClick={() => setLanguage('hi')}
              aria-pressed={language === 'hi'}
            >
              हिंदी
            </button>
          </div>
        </div>
      </header>

      <main id="login-content" className="login-main">
        <div className="container login-grid">
          <section className="login-story">
            <div className="eyebrow login-eyebrow">
              <Sparkles size={16} aria-hidden="true" />
              {t('A calmer way through', 'एक आसान और भरोसेमंद रास्ता')}
            </div>
            <h1>
              {t('Your licence work,', 'आपका लाइसेंस काम,')}
              <span>{t(' made clear.', ' अब बिल्कुल स्पष्ट।')}</span>
            </h1>
            <p>
              {t(
                'Sign in to try one continuous journey for licence renewal, status tracking and documents—without the maze of menus.',
                'लाइसेंस नवीनीकरण, स्थिति ट्रैकिंग और दस्तावेज़ों के लिए एक सीधी प्रक्रिया आज़माने हेतु साइन इन करें।',
              )}
            </p>
            <div className="login-trust-list">
              <div>
                <span>
                  <ShieldCheck size={21} aria-hidden="true" />
                </span>
                <div>
                  <strong>{t('Safe by design', 'सुरक्षा पहले')}</strong>
                  <p>
                    {t(
                      'No Aadhaar, OTP, real password or payment.',
                      'कोई आधार, असली OTP, पासवर्ड या भुगतान नहीं।',
                    )}
                  </p>
                </div>
              </div>
              <div>
                <span>
                  <Clock3 size={21} aria-hidden="true" />
                </span>
                <div>
                  <strong>{t('Six-minute journey', 'छह मिनट की प्रक्रिया')}</strong>
                  <p>
                    {t(
                      'Only questions that change your next step.',
                      'सिर्फ़ वही सवाल जो आपका अगला कदम तय करें।',
                    )}
                  </p>
                </div>
              </div>
              <div>
                <span>
                  <Languages size={21} aria-hidden="true" />
                </span>
                <div>
                  <strong>{t('English and Hindi', 'अंग्रेज़ी और हिंदी')}</strong>
                  <p>
                    {t(
                      'Switch language at any point.',
                      'किसी भी समय भाषा बदलें।',
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="login-card" aria-labelledby="sign-in-title">
            <div className="login-card-heading">
              <span className="login-lock">
                <LockKeyhole size={23} aria-hidden="true" />
              </span>
              <div>
                <p className="overline">{t('Secure demo access', 'सुरक्षित डेमो प्रवेश')}</p>
                <h2 id="sign-in-title">{t('Welcome to Raahi', 'राही में आपका स्वागत है')}</h2>
              </div>
            </div>

            <div className="auth-tabs" role="tablist" aria-label="Sign-in method">
              <button
                role="tab"
                aria-selected={authMode === 'credentials'}
                className={authMode === 'credentials' ? 'active' : ''}
                onClick={() => {
                  setAuthMode('credentials')
                  setAuthError('')
                }}
              >
                <KeyRound size={17} aria-hidden="true" />
                {t('Username', 'यूज़रनेम')}
              </button>
              <button
                role="tab"
                aria-selected={authMode === 'phone'}
                className={authMode === 'phone' ? 'active' : ''}
                onClick={() => {
                  setAuthMode('phone')
                  setAuthError('')
                }}
              >
                <Smartphone size={17} aria-hidden="true" />
                {t('Phone', 'फ़ोन')}
              </button>
            </div>

            {authMode === 'credentials' ? (
              <form className="auth-form" onSubmit={signInWithCredentials}>
                <label className="field">
                  <span>{t('Username', 'यूज़रनेम')}</span>
                  <input
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value)
                      setAuthError('')
                    }}
                    autoComplete="username"
                    spellCheck={false}
                  />
                </label>
                <label className="field">
                  <span>{t('Password', 'पासवर्ड')}</span>
                  <span className="input-with-action">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value)
                        setAuthError('')
                      }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff size={18} aria-hidden="true" />
                      ) : (
                        <Eye size={18} aria-hidden="true" />
                      )}
                    </button>
                  </span>
                </label>
                <div className="credential-hint">
                  <div>
                    <span>{t('Demo username', 'डेमो यूज़रनेम')}</span>
                    <strong>testuser</strong>
                  </div>
                  <div>
                    <span>{t('Demo password', 'डेमो पासवर्ड')}</span>
                    <strong>test123</strong>
                  </div>
                </div>
                {authError && (
                  <div className="error-message auth-error" role="alert">
                    <Info size={18} aria-hidden="true" />
                    {authError}
                  </div>
                )}
                <button className="button primary auth-submit" type="submit">
                  {t('Sign in to demo', 'डेमो में साइन इन करें')}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </form>
            ) : (
              <form
                className="auth-form"
                onSubmit={otpSent ? verifyDemoCode : requestDemoCode}
              >
                <label className="field">
                  <span>{t('Demo phone number', 'डेमो फ़ोन नंबर')}</span>
                  <span className="phone-field">
                    <span>+91</span>
                    <input
                      value={phoneNumber}
                      onChange={(event) => {
                        setPhoneNumber(event.target.value)
                        setOtpSent(false)
                        setOtp('')
                        setAuthError('')
                      }}
                      inputMode="numeric"
                      autoComplete="tel"
                    />
                  </span>
                  <small>
                    {t(
                      'Use the pre-filled fictional number. No SMS is sent.',
                      'पहले से भरा काल्पनिक नंबर उपयोग करें। कोई SMS नहीं भेजा जाता।',
                    )}
                  </small>
                </label>
                {otpSent && (
                  <>
                    <div className="demo-code-callout" aria-live="polite">
                      <BadgeCheck size={20} aria-hidden="true" />
                      <div>
                        <strong>{t('Demo code ready', 'डेमो कोड तैयार है')}</strong>
                        <span>
                          {t('Enter ', 'दर्ज करें ')}
                          <b>123456</b>
                          {t(' below. No SMS was sent.', '। कोई SMS नहीं भेजा गया।')}
                        </span>
                      </div>
                    </div>
                    <label className="field">
                      <span>{t('6-digit demo code', '6 अंकों का डेमो कोड')}</span>
                      <input
                        className="otp-input"
                        value={otp}
                        onChange={(event) => {
                          setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
                          setAuthError('')
                        }}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        placeholder="123456"
                      />
                    </label>
                  </>
                )}
                {authError && (
                  <div className="error-message auth-error" role="alert">
                    <Info size={18} aria-hidden="true" />
                    {authError}
                  </div>
                )}
                <button className="button primary auth-submit" type="submit">
                  {otpSent
                    ? t('Verify and sign in', 'सत्यापित कर साइन इन करें')
                    : t('Get demo code', 'डेमो कोड पाएँ')}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </form>
            )}

            <div className="login-disclaimer">
              <ShieldCheck size={17} aria-hidden="true" />
              <p>
                {t(
                  'Authentication is simulated locally for this prototype. Never enter a real password or phone number.',
                  'इस प्रोटोटाइप में प्रमाणीकरण स्थानीय रूप से सिम्युलेट किया गया है। असली पासवर्ड या फ़ोन नंबर कभी दर्ज न करें।',
                )}
              </p>
            </div>
          </section>
        </div>
      </main>
      <div className="login-footer">
        <div className="container">
          <span>Raahi</span>
          <p>
            {t(
              'Independent prototype for Build What Moves India',
              'Build What Moves India के लिए स्वतंत्र प्रोटोटाइप',
            )}
          </p>
        </div>
      </div>
    </div>
  )

  if (!authenticated) {
    return renderLogin()
  }

  const renderHome = () => (
    <main id="main-content">
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={16} aria-hidden="true" />
              {t('Citizen road services', 'नागरिक सड़क सेवाएँ')}
            </div>
            <h1>
              {t('Road services,', 'सड़क सेवाएँ,')}
              <span>
                {t(' made easier to complete.', ' अब पूरी करना आसान।')}
              </span>
            </h1>
            <p className="hero-description">
              {t(
                'Complete the road services people use most: renew a licence, track an application, check a challan, find an RTO and get documents.',
                'सबसे अधिक उपयोग होने वाली सड़क सेवाएँ पूरी करें: लाइसेंस नवीनीकरण, आवेदन ट्रैकिंग, चालान जाँच, RTO खोज और दस्तावेज़।',
              )}
            </p>
            <button
              className="roadready-highlight"
              onClick={() => navigate('road-ready')}
              aria-label={t('Create a RoadReady Pass', 'RoadReady पास बनाएँ')}
            >
              <span className="roadready-highlight-icon">
                <Sparkles size={22} aria-hidden="true" />
              </span>
              <span>
                <small>{t('New · VisitTwin simulation', 'नया · VisitTwin सिम्युलेशन')}</small>
                <strong>{t('Create a RoadReady Pass', 'RoadReady पास बनाएँ')}</strong>
                <em>
                  {t(
                    'Rehearse every counter and prevent a failed visit',
                    'हर काउंटर का अभ्यास करें और विफल यात्रा रोकें',
                  )}
                </em>
              </span>
              <ArrowRight size={19} aria-hidden="true" />
            </button>
            <div className="hero-actions">
              <button className="button primary large" onClick={startFresh}>
                {t('Renew my licence', 'लाइसेंस नवीनीकरण करें')}
                <ArrowRight size={19} aria-hidden="true" />
              </button>
              <button
                className="button secondary large"
                onClick={() => navigate('track')}
              >
                <Search size={18} aria-hidden="true" />
                {t('Track an application', 'आवेदन ट्रैक करें')}
              </button>
            </div>
            <div className="hero-assurance" aria-label="Service assurances">
              <span>
                <Clock3 size={17} aria-hidden="true" />
                {t('About 6 minutes', 'लगभग 6 मिनट')}
              </span>
              <span>
                <ShieldCheck size={17} aria-hidden="true" />
                {t('Fictional data only', 'केवल काल्पनिक डेटा')}
              </span>
              <span>
                <Wifi size={17} aria-hidden="true" />
                {t('Works on slow networks', 'धीमे नेटवर्क पर भी')}
              </span>
            </div>
          </div>

          <div className="hero-showcase">
            <MobilityHeroScene
              onOpenRoadReady={() => navigate('road-ready')}
            />
          {showLegacyServicePanel && (
          <div
            className="service-panel legacy-service-panel"
            aria-label="Most used road services"
            hidden
          >
            <div className="service-panel-header">
              <div>
                <p className="overline">{t('Common services', 'सामान्य सेवाएँ')}</p>
                <h2>{t('Choose a task', 'अपना काम चुनें')}</h2>
              </div>
              <span className="time-badge">{t('8 services', '8 सेवाएँ')}</span>
            </div>

            <button
              className="service-row roadready-service-row"
              onClick={() => navigate('road-ready')}
            >
              <span className="service-icon green">
                <Sparkles size={22} aria-hidden="true" />
              </span>
              <span className="service-row-copy">
                <strong>{t('RoadReady One-Visit Pass', 'RoadReady एक-यात्रा पास')}</strong>
                <small>
                  {t(
                    'Bundle services and pre-check readiness',
                    'सेवाएँ जोड़ें और तैयारी पूर्व-जाँच करें',
                  )}
                </small>
              </span>
              <ChevronRight size={20} aria-hidden="true" />
            </button>

            <button
              className="service-row featured"
              onClick={() => navigate('new-licence')}
            >
              <span className="service-icon green">
                <UserRound size={23} aria-hidden="true" />
              </span>
              <span className="service-row-copy">
                <strong>
                  {t(
                    'Apply for a new driving licence',
                    'नए ड्राइविंग लाइसेंस के लिए आवेदन करें',
                  )}
                </strong>
                <small>
                  {t(
                    "Eligibility, learner's test and fee",
                    'पात्रता, लर्नर टेस्ट और शुल्क',
                  )}
                </small>
              </span>
              <ChevronRight size={20} aria-hidden="true" />
            </button>

            <button className="service-row featured" onClick={startFresh}>
              <span className="service-icon green">
                <BadgeCheck size={23} aria-hidden="true" />
              </span>
              <span className="service-row-copy">
                <strong>{t('Renew driving licence', 'ड्राइविंग लाइसेंस नवीनीकरण')}</strong>
                <small>
                  {t(
                    'Eligibility, documents and appointment',
                    'पात्रता, दस्तावेज़ और अपॉइंटमेंट',
                  )}
                </small>
              </span>
              <ChevronRight size={20} aria-hidden="true" />
            </button>

            <button className="service-row" onClick={() => navigate('track')}>
              <span className="service-icon blue">
                <Gauge size={22} aria-hidden="true" />
              </span>
              <span className="service-row-copy">
                <strong>{t('Track application', 'आवेदन ट्रैक करें')}</strong>
                <small>
                  {t('See progress and next action', 'प्रगति और अगला कदम देखें')}
                </small>
              </span>
              <ChevronRight size={20} aria-hidden="true" />
            </button>

            <button
              className="service-row"
              onClick={() => navigate('appointment')}
            >
              <span className="service-icon blue">
                <CalendarDays size={22} aria-hidden="true" />
              </span>
              <span className="service-row-copy">
                <strong>{t('Manage appointment', 'अपॉइंटमेंट प्रबंधित करें')}</strong>
                <small>
                  {t(
                    'Reschedule, send location and view map',
                    'समय बदलें, स्थान भेजें और नक्शा देखें',
                  )}
                </small>
              </span>
              <ChevronRight size={20} aria-hidden="true" />
            </button>

            <button className="service-row" onClick={() => navigate('challan')}>
              <span className="service-icon amber">
                <ReceiptText size={22} aria-hidden="true" />
              </span>
              <span className="service-row-copy">
                <strong>{t('Check eChallan', 'ई-चालान जाँचें')}</strong>
                <small>
                  {t(
                    'View a violation and make a demo payment',
                    'उल्लंघन देखें और डेमो भुगतान करें',
                  )}
                </small>
              </span>
              <ChevronRight size={20} aria-hidden="true" />
            </button>

            <button
              className="service-row"
              onClick={() => {
                setRtoReturnView('renew')
                navigate('rto')
              }}
            >
              <span className="service-icon blue">
                <MapPin size={22} aria-hidden="true" />
              </span>
              <span className="service-row-copy">
                <strong>{t('Find an RTO', 'RTO खोजें')}</strong>
                <small>
                  {t(
                    'Compare services, hours and next slots',
                    'सेवाएँ, समय और अगले स्लॉट की तुलना करें',
                  )}
                </small>
              </span>
              <ChevronRight size={20} aria-hidden="true" />
            </button>

            <button
              className="service-row"
              onClick={() => navigate('documents')}
            >
              <span className="service-icon amber">
                <ReceiptText size={22} aria-hidden="true" />
              </span>
              <span className="service-row-copy">
                <strong>{t('Get documents', 'दस्तावेज़ पाएँ')}</strong>
                <small>
                  {t('Receipt and appointment slip', 'रसीद और अपॉइंटमेंट स्लिप')}
                </small>
              </span>
              <ChevronRight size={20} aria-hidden="true" />
            </button>

            <div className="panel-note">
              <Info size={18} aria-hidden="true" />
              <p>
                {t(
                  'This prototype never asks for Aadhaar, OTPs or real payment details.',
                  'यह प्रोटोटाइप कभी आधार, OTP या असली भुगतान विवरण नहीं माँगता।',
                )}
              </p>
            </div>
          </div>
          )}
          </div>
        </div>
      </section>

      <TransportServiceHub
        t={t}
        onRoadReady={() => navigate('road-ready')}
        onNewLicence={() => navigate('new-licence')}
        onRenew={startFresh}
        onTrack={() => navigate('track')}
        onAppointment={() => navigate('appointment')}
        onChallan={() => navigate('challan')}
        onRto={() => {
          setRtoReturnView('renew')
          navigate('rto')
        }}
        onDocuments={() => navigate('documents')}
      />

      {application && (
        <section className="active-application-section">
          <div className="container">
            <div className="active-application-card">
              <div className="active-status-icon">
                <CheckCircle2 size={24} aria-hidden="true" />
              </div>
              <div className="active-application-copy">
                <p className="overline">{t('Your demo application', 'आपका डेमो आवेदन')}</p>
                <h2>{t('Appointment confirmed', 'अपॉइंटमेंट की पुष्टि हुई')}</h2>
                <p>
                  {application.appointmentDate} · {application.appointmentTime} ·{' '}
                  {application.centre}
                </p>
              </div>
              <div className="active-application-actions">
                <button
                  className="button secondary"
                  onClick={() => navigate('track')}
                >
                  {t('View progress', 'प्रगति देखें')}
                </button>
                <button
                  className="button primary"
                  onClick={() => navigate('appointment')}
                >
                  {t('Manage appointment', 'अपॉइंटमेंट प्रबंधित करें')}
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="how-section">
        <div className="container">
          <div className="section-heading">
            <p className="overline">{t('Designed around you', 'आपके लिए बनाया गया')}</p>
            <h2>{t('From “where do I start?” to done.', '“कहाँ से शुरू करूँ?” से काम पूरा।')}</h2>
            <p>
              {t(
                'Raahi asks only what changes your journey, then explains every decision.',
                'राही केवल वही पूछता है जो आपकी प्रक्रिया बदलता है और हर निर्णय समझाता है।',
              )}
            </p>
          </div>
          <div className="how-grid">
            <article className="how-card">
              <span>01</span>
              <div className="how-icon">
                <UserRound size={25} aria-hidden="true" />
              </div>
              <h3>{t('Tell us the task', 'अपना काम बताएँ')}</h3>
              <p>
                {t(
                  'Choose the outcome you need, not a department or form number.',
                  'विभाग या फ़ॉर्म नंबर नहीं, बस अपना ज़रूरी परिणाम चुनें।',
                )}
              </p>
            </article>
            <article className="how-card">
              <span>02</span>
              <div className="how-icon">
                <FileCheck2 size={25} aria-hidden="true" />
              </div>
              <h3>{t('Get a smart checklist', 'सही चेकलिस्ट पाएँ')}</h3>
              <p>
                {t(
                  'See only the documents and steps that apply to your situation.',
                  'सिर्फ़ वही दस्तावेज़ और कदम देखें जो आप पर लागू होते हैं।',
                )}
              </p>
            </article>
            <article className="how-card">
              <span>03</span>
              <div className="how-icon">
                <BadgeCheck size={25} aria-hidden="true" />
              </div>
              <h3>{t('Finish with certainty', 'विश्वास से पूरा करें')}</h3>
              <p>
                {t(
                  'Leave with a confirmation, timeline and one clear next action.',
                  'पुष्टि, समय-सीमा और एक स्पष्ट अगले कदम के साथ आगे बढ़ें।',
                )}
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  )

  const renderStepper = () => (
    <div className="stepper" aria-label="Renewal progress">
      {steps.map((label, index) => {
        const position = index + 1
        const isComplete = position < step
        const isCurrent = position === step
        return (
          <div
            className={`step-item ${isComplete ? 'complete' : ''} ${
              isCurrent ? 'current' : ''
            }`}
            key={label}
          >
            <span className="step-dot" aria-current={isCurrent ? 'step' : undefined}>
              {isComplete ? <Check size={15} aria-hidden="true" /> : position}
            </span>
            <span className="step-label">{label}</span>
          </div>
        )
      })}
    </div>
  )

  const renderRenewalStep = () => {
    if (step === 1) {
      return (
        <>
          <div className="form-heading">
            <p className="overline">{t('Step 1 of 5', 'चरण 1 / 5')}</p>
            <h1>{t('Find your licence', 'अपना लाइसेंस खोजें')}</h1>
            <p>
              {t(
                'We use these details only to personalize this fictional demo.',
                'इन विवरणों का उपयोग केवल इस काल्पनिक डेमो को व्यक्तिगत बनाने के लिए होता है।',
              )}
            </p>
          </div>
          <div className="form-grid">
            <label className="field full">
              <span>{t('Driving licence number', 'ड्राइविंग लाइसेंस नंबर')}</span>
              <input
                value={form.licenceNumber}
                onChange={(event) =>
                  updateForm('licenceNumber', event.target.value.toUpperCase())
                }
                placeholder="DL-0420110149646"
                autoComplete="off"
              />
              <small>
                {t(
                  'Demo format: state code + year + number',
                  'डेमो प्रारूप: राज्य कोड + वर्ष + नंबर',
                )}
              </small>
            </label>
            <label className="field">
              <span>{t('Date of birth', 'जन्म तिथि')}</span>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(event) => updateForm('dateOfBirth', event.target.value)}
              />
            </label>
            <label className="field">
              <span>{t('State that issued the licence', 'लाइसेंस जारी करने वाला राज्य')}</span>
              <select
                value={form.state}
                onChange={(event) => updateForm('state', event.target.value)}
              >
                <option>Delhi</option>
                <option>Karnataka</option>
                <option>Maharashtra</option>
                <option>Uttar Pradesh</option>
              </select>
            </label>
          </div>
          <div className="privacy-note">
            <ShieldCheck size={20} aria-hidden="true" />
            <div>
              <strong>{t('Safe demo', 'सुरक्षित डेमो')}</strong>
              <p>
                {t(
                  'The details above are pre-filled and fictional. No government system is contacted.',
                  'ऊपर दिए गए विवरण पहले से भरे और काल्पनिक हैं। किसी सरकारी प्रणाली से संपर्क नहीं किया जाता।',
                )}
              </p>
            </div>
          </div>
        </>
      )
    }

    if (step === 2) {
      return (
        <>
          <div className="form-heading">
            <p className="overline">{t('Step 2 of 5', 'चरण 2 / 5')}</p>
            <h1>{t('You can renew online', 'आप ऑनलाइन नवीनीकरण कर सकते हैं')}</h1>
            <p>
              {t(
                'We checked the demo licence against the renewal rules.',
                'हमने डेमो लाइसेंस को नवीनीकरण नियमों के अनुसार जाँचा।',
              )}
            </p>
          </div>
          <div className="eligibility-card">
            <span className="eligibility-icon">
              <CheckCircle2 size={27} aria-hidden="true" />
            </span>
            <div>
              <strong>{t('Eligible for standard renewal', 'सामान्य नवीनीकरण के लिए पात्र')}</strong>
              <p>
                {t(
                  `Your licence expires on 30 September 2026. At age ${age}, this demo does not require a medical certificate.`,
                  `आपका लाइसेंस 30 सितंबर 2026 को समाप्त होगा। ${age} वर्ष की आयु में इस डेमो के लिए मेडिकल प्रमाणपत्र आवश्यक नहीं है।`,
                )}
              </p>
            </div>
          </div>
          <div className="fact-grid">
            <div>
              <span>{t('Current status', 'वर्तमान स्थिति')}</span>
              <strong>{t('Active', 'सक्रिय')}</strong>
            </div>
            <div>
              <span>{t('Vehicle class', 'वाहन श्रेणी')}</span>
              <strong>LMV + MCWG</strong>
            </div>
            <div>
              <span>{t('Driving test', 'ड्राइविंग टेस्ट')}</span>
              <strong>{t('Not required', 'आवश्यक नहीं')}</strong>
            </div>
          </div>
          <div className="form-grid spaced">
            <label className="field">
              <span>{t('Mobile number', 'मोबाइल नंबर')}</span>
              <input
                value={form.phone}
                onChange={(event) => updateForm('phone', event.target.value)}
                inputMode="numeric"
                autoComplete="off"
              />
              <small>{t('Fictional demo number', 'काल्पनिक डेमो नंबर')}</small>
            </label>
            <div className="field">
              <span>{t('Residential address', 'आवासीय पता')}</span>
              <label className="choice-card compact">
                <input
                  type="checkbox"
                  checked={!form.addressChanged}
                  onChange={(event) =>
                    updateForm('addressChanged', !event.target.checked)
                  }
                />
                <span>
                  <strong>{t('My address has not changed', 'मेरा पता नहीं बदला है')}</strong>
                  <small>{form.address}</small>
                </span>
              </label>
            </div>
            {form.addressChanged && (
              <label className="field full">
                <span>{t('Current address', 'वर्तमान पता')}</span>
                <textarea
                  value={form.address}
                  onChange={(event) => updateForm('address', event.target.value)}
                  rows={3}
                />
              </label>
            )}
          </div>
        </>
      )
    }

    if (step === 3) {
      return (
        <>
          <div className="form-heading">
            <p className="overline">{t('Step 3 of 5', 'चरण 3 / 5')}</p>
            <h1>{t('Your document checklist', 'आपकी दस्तावेज़ चेकलिस्ट')}</h1>
            <p>
              {t(
                'Only the documents that apply to this renewal are shown.',
                'केवल इस नवीनीकरण पर लागू दस्तावेज़ दिखाए गए हैं।',
              )}
            </p>
          </div>
          <div className="document-list">
            {[
              {
                title: t('Current driving licence', 'वर्तमान ड्राइविंग लाइसेंस'),
                note: t(
                  'Verified from the fictional licence record',
                  'काल्पनिक लाइसेंस रिकॉर्ड से सत्यापित',
                ),
              },
              {
                title: t('Photograph and signature', 'फोटो और हस्ताक्षर'),
                note: t(
                  'Existing demo record can be reused',
                  'मौजूदा डेमो रिकॉर्ड का दोबारा उपयोग हो सकता है',
                ),
              },
              {
                title: t('Address proof', 'पते का प्रमाण'),
                note: t(
                  'Not needed because the address is unchanged',
                  'पता न बदलने के कारण आवश्यक नहीं',
                ),
              },
            ].map((document) => (
              <div className="document-row" key={document.title}>
                <span className="document-icon">
                  <FileCheck2 size={21} aria-hidden="true" />
                </span>
                <div>
                  <strong>{document.title}</strong>
                  <p>{document.note}</p>
                </div>
                <span className="verified-pill">
                  <Check size={14} aria-hidden="true" />
                  {t('Ready', 'तैयार')}
                </span>
              </div>
            ))}
          </div>
          <label className="choice-card confirmation-choice">
            <input
              type="checkbox"
              checked={documentsConfirmed}
              onChange={(event) => {
                setDocumentsConfirmed(event.target.checked)
                setError('')
              }}
            />
            <span>
              <strong>
                {t(
                  'I have reviewed this checklist',
                  'मैंने इस चेकलिस्ट की समीक्षा कर ली है',
                )}
              </strong>
              <small>
                {t(
                  'No files are uploaded in this prototype.',
                  'इस प्रोटोटाइप में कोई फ़ाइल अपलोड नहीं होती।',
                )}
              </small>
            </span>
          </label>
        </>
      )
    }

    if (step === 4) {
      return (
        <>
          <div className="form-heading">
            <p className="overline">{t('Step 4 of 5', 'चरण 4 / 5')}</p>
            <h1>{t('Choose an appointment', 'अपॉइंटमेंट चुनें')}</h1>
            <p>
              {t(
                'The nearest demo centre is selected. You can change it.',
                'निकटतम डेमो केंद्र चुना गया है। आप इसे बदल सकते हैं।',
              )}
            </p>
          </div>
          <div className="appointment-layout">
            <div>
              <div className="centre-card">
                <span className="centre-icon">
                  <MapPin size={22} aria-hidden="true" />
                </span>
                <div>
                  <p className="overline">{t('Selected centre', 'चुना गया केंद्र')}</p>
                  <strong>{selectedCentre}</strong>
                  <span>{t('2.4 km away · Wheelchair accessible', '2.4 किमी दूर · व्हीलचेयर अनुकूल')}</span>
                </div>
                <button type="button" className="text-button">
                  {t('Change', 'बदलें')}
                </button>
              </div>
              <div className="selection-group">
                <label>{t('Available date', 'उपलब्ध तारीख')}</label>
                <div className="date-options">
                  {demoAppointmentDates.map((date) => {
                    const value = date.value
                    return (
                      <button
                        type="button"
                        className={selectedDate === value ? 'selected' : ''}
                        onClick={() => setSelectedDate(value)}
                        key={value}
                      >
                        <span>{date.weekday}</span>
                        <strong>{date.day}</strong>
                        <small>{date.month}</small>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="selection-group">
                <label>{t('Available time', 'उपलब्ध समय')}</label>
                <div className="slot-options">
                  {appointmentSlots.map((slot) => (
                    <button
                      type="button"
                      className={selectedSlot === slot ? 'selected' : ''}
                      onClick={() => setSelectedSlot(slot)}
                      key={slot}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <aside className="fee-card">
              <p className="overline">{t('Fee summary', 'शुल्क विवरण')}</p>
              <div>
                <span>{t('Renewal fee', 'नवीनीकरण शुल्क')}</span>
                <strong>₹400</strong>
              </div>
              <div>
                <span>{t('Smart card fee', 'स्मार्ट कार्ड शुल्क')}</span>
                <strong>₹200</strong>
              </div>
              <div className="fee-total">
                <span>{t('Total', 'कुल')}</span>
                <strong>₹600</strong>
              </div>
              <p className="fee-note">
                <WalletCards size={17} aria-hidden="true" />
                {t(
                  'Payment is simulated. No card or UPI details are collected.',
                  'भुगतान केवल डेमो है। कार्ड या UPI विवरण नहीं लिया जाता।',
                )}
              </p>
            </aside>
          </div>
        </>
      )
    }

    if (step === 5) {
      return (
        <>
          <div className="form-heading">
            <p className="overline">{t('Step 5 of 5', 'चरण 5 / 5')}</p>
            <h1>{t('Review before submitting', 'जमा करने से पहले समीक्षा करें')}</h1>
            <p>
              {t(
                'Everything is in one place. Edit any section if something looks wrong.',
                'सब कुछ एक जगह है। कुछ गलत लगे तो किसी भी अनुभाग को बदलें।',
              )}
            </p>
          </div>
          <div className="review-sections">
            <div className="review-row">
              <span className="review-icon">
                <UserRound size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="overline">{t('Applicant', 'आवेदक')}</p>
                <strong>Aarav Mehta</strong>
                <span>{form.licenceNumber} · {form.phone}</span>
              </div>
              <button type="button" className="text-button" onClick={() => setStep(1)}>
                {t('Edit', 'बदलें')}
              </button>
            </div>
            <div className="review-row">
              <span className="review-icon">
                <FileText size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="overline">{t('Service', 'सेवा')}</p>
                <strong>{t('Driving licence renewal', 'ड्राइविंग लाइसेंस नवीनीकरण')}</strong>
                <span>{t('LMV + MCWG · Standard renewal', 'LMV + MCWG · सामान्य नवीनीकरण')}</span>
              </div>
              <button type="button" className="text-button" onClick={() => setStep(2)}>
                {t('Edit', 'बदलें')}
              </button>
            </div>
            <div className="review-row">
              <span className="review-icon">
                <CalendarDays size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="overline">{t('Appointment', 'अपॉइंटमेंट')}</p>
                <strong>{selectedDate} · {selectedSlot}</strong>
                <span>{selectedCentre}</span>
              </div>
              <button type="button" className="text-button" onClick={() => setStep(4)}>
                {t('Edit', 'बदलें')}
              </button>
            </div>
            <div className="review-row">
              <span className="review-icon">
                <WalletCards size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="overline">{t('Mock payment', 'डेमो भुगतान')}</p>
                <strong>₹600</strong>
                <span>{t('No real payment will be made', 'कोई वास्तविक भुगतान नहीं होगा')}</span>
              </div>
            </div>
          </div>
          <label className="choice-card confirmation-choice">
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => {
                setConsent(event.target.checked)
                setError('')
              }}
            />
            <span>
              <strong>
                {t(
                  'The fictional information above is correct',
                  'ऊपर दी गई काल्पनिक जानकारी सही है',
                )}
              </strong>
              <small>
                {t(
                  'I understand this does not submit to a government system.',
                  'मैं समझता/समझती हूँ कि यह किसी सरकारी प्रणाली में जमा नहीं होता।',
                )}
              </small>
            </span>
          </label>
        </>
      )
    }

    return (
      <div className="success-view">
        <div className="success-mark">
          <Check size={37} aria-hidden="true" />
        </div>
        <p className="overline">{t('Demo application submitted', 'डेमो आवेदन जमा हुआ')}</p>
        <h1>{t('Your appointment is confirmed.', 'आपका अपॉइंटमेंट तय हो गया है।')}</h1>
        <p className="success-description">
          {t(
            'Save the application number below. We have also prepared your receipt and appointment slip.',
            'नीचे दिया आवेदन नंबर सुरक्षित रखें। आपकी रसीद और अपॉइंटमेंट स्लिप भी तैयार है।',
          )}
        </p>
        <div className="application-number">
          <span>{t('Application number', 'आवेदन नंबर')}</span>
          <strong>{APPLICATION_ID}</strong>
        </div>
        <div className="success-details">
          <div>
            <CalendarDays size={20} aria-hidden="true" />
            <span>{t('Appointment', 'अपॉइंटमेंट')}</span>
            <strong>{selectedDate}, {selectedSlot}</strong>
          </div>
          <div>
            <MapPin size={20} aria-hidden="true" />
            <span>{t('Centre', 'केंद्र')}</span>
            <strong>{selectedCentre}</strong>
          </div>
        </div>
        <div className="success-actions">
          <button
            className="button primary"
            onClick={() => downloadDocument('Renewal receipt')}
          >
            <Download size={18} aria-hidden="true" />
            {t('Download receipt', 'रसीद डाउनलोड करें')}
          </button>
          <button className="button secondary" onClick={() => navigate('track')}>
            {t('Track progress', 'प्रगति ट्रैक करें')}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
        <button className="text-button standalone" onClick={() => navigate('home')}>
          {t('Return home', 'होम पर लौटें')}
        </button>
      </div>
    )
  }

  const renderRenewal = () => (
    <main id="main-content" className="flow-page">
      <div className="container flow-container">
        <button className="back-button" onClick={() => navigate('home')}>
          <ArrowLeft size={18} aria-hidden="true" />
          {t('Back to services', 'सेवाओं पर वापस जाएँ')}
        </button>
        {step <= 5 && renderStepper()}
        <section className={`form-card ${step === 6 ? 'success-card' : ''}`}>
          {renderRenewalStep()}
          {error && (
            <div className="error-message" role="alert">
              <Info size={18} aria-hidden="true" />
              {error}
            </div>
          )}
          {step <= 5 && (
            <div className="form-actions">
              {step > 1 ? (
                <button
                  className="button ghost"
                  onClick={() => {
                    setStep((current) => current - 1)
                    setError('')
                  }}
                  disabled={loading}
                >
                  <ArrowLeft size={18} aria-hidden="true" />
                  {t('Back', 'पीछे')}
                </button>
              ) : (
                <span />
              )}
              <button
                className="button primary"
                onClick={step === 5 ? submitApplication : continueRenewal}
                disabled={loading}
              >
                {loading
                  ? t('Checking…', 'जाँच हो रही है…')
                  : step === 1
                    ? t('Check eligibility', 'पात्रता जाँचें')
                    : step === 5
                      ? t('Submit demo application', 'डेमो आवेदन जमा करें')
                      : t('Continue', 'आगे बढ़ें')}
                {!loading && <ArrowRight size={18} aria-hidden="true" />}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )

  const renderTrack = () => (
    <main id="main-content" className="inner-page">
      <div className="container narrow-container">
        <button className="back-button" onClick={() => navigate('home')}>
          <ArrowLeft size={18} aria-hidden="true" />
          {t('Back to services', 'सेवाओं पर वापस जाएँ')}
        </button>
        <div className="page-heading">
          <p className="overline">{t('No login needed', 'लॉगिन की ज़रूरत नहीं')}</p>
          <h1>{t('Track your application', 'अपना आवेदन ट्रैक करें')}</h1>
          <p>
            {t(
              'See what is complete, what is next and whether you need to act.',
              'देखें क्या पूरा हुआ, आगे क्या है और आपको क्या करना है।',
            )}
          </p>
        </div>
        <section className="tracking-card">
          <label className="field">
            <span>{t('Application number', 'आवेदन नंबर')}</span>
            <div className="search-field">
              <input
                value={trackingQuery}
                onChange={(event) => {
                  setTrackingQuery(event.target.value.toUpperCase())
                  setTrackingVisible(false)
                }}
                placeholder={APPLICATION_ID}
              />
              <button
                className="button primary"
                onClick={() => setTrackingVisible(Boolean(trackingQuery.trim()))}
              >
                <Search size={18} aria-hidden="true" />
                {t('Track', 'ट्रैक करें')}
              </button>
            </div>
            <small>
              {t(
                `Try the fictional number ${APPLICATION_ID}`,
                `काल्पनिक नंबर ${APPLICATION_ID} आज़माएँ`,
              )}
            </small>
          </label>

          {trackingVisible && trackingQuery && (
            <div className="tracking-result">
              <div className="tracking-summary">
                <span className="active-status-icon">
                  <CalendarDays size={23} aria-hidden="true" />
                </span>
                <div>
                  <p className="overline">{t('Current status', 'वर्तमान स्थिति')}</p>
                  <h2>{t('Appointment booked', 'अपॉइंटमेंट बुक हुआ')}</h2>
                  <p>
                    {t(
                      'Your documents passed the demo review. Visit the selected centre next.',
                      'आपके दस्तावेज़ डेमो समीक्षा में पास हुए। अब चुने हुए केंद्र पर जाएँ।',
                    )}
                  </p>
                </div>
                <span className="status-pill">{t('On track', 'सही समय पर')}</span>
              </div>
              <div className="next-action-card">
                <Clock3 size={21} aria-hidden="true" />
                <div>
                  <p className="overline">{t('Your next action', 'आपका अगला कदम')}</p>
                  <strong>
                    {application?.appointmentDate ?? '14 Sep 2026'} ·{' '}
                    {application?.appointmentTime ?? '09:30 AM'}
                  </strong>
                  <span>
                    {t(
                      `Arrive 10 minutes early at ${application?.centre ?? selectedCentre}.`,
                      `${application?.centre ?? selectedCentre} पर 10 मिनट पहले पहुँचें।`,
                    )}
                  </span>
                </div>
              </div>
              <ol className="status-timeline">
                {[
                  {
                    label: t('Application submitted', 'आवेदन जमा हुआ'),
                    meta: t('08 Sep · Complete', '08 सितंबर · पूरा'),
                    done: true,
                  },
                  {
                    label: t('Documents checked', 'दस्तावेज़ जाँचे गए'),
                    meta: t('08 Sep · Complete', '08 सितंबर · पूरा'),
                    done: true,
                  },
                  {
                    label: t('Visit the centre', 'केंद्र पर जाएँ'),
                    meta: t('14 Sep · Next', '14 सितंबर · अगला कदम'),
                    done: false,
                    current: true,
                  },
                  {
                    label: t('Licence dispatched', 'लाइसेंस भेजा गया'),
                    meta: t('Expected within 7 days', '7 दिनों में अपेक्षित'),
                    done: false,
                  },
                ].map((item) => (
                  <li
                    className={`${item.done ? 'done' : ''} ${
                      item.current ? 'current' : ''
                    }`}
                    key={item.label}
                  >
                    <span className="timeline-dot">
                      {item.done && <Check size={13} aria-hidden="true" />}
                    </span>
                    <div>
                      <strong>{item.label}</strong>
                      <span>{item.meta}</span>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="tracking-actions">
                <button
                  className="button secondary"
                  onClick={() => downloadDocument('Appointment slip')}
                >
                  <Download size={18} aria-hidden="true" />
                  {t('Appointment slip', 'अपॉइंटमेंट स्लिप')}
                </button>
                <button
                  className="button ghost"
                  onClick={() => navigate('documents')}
                >
                  {t('All documents', 'सभी दस्तावेज़')}
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )

  const renderDocuments = () => (
    <main id="main-content" className="inner-page">
      <div className="container narrow-container">
        <button className="back-button" onClick={() => navigate('home')}>
          <ArrowLeft size={18} aria-hidden="true" />
          {t('Back to services', 'सेवाओं पर वापस जाएँ')}
        </button>
        <div className="page-heading">
          <p className="overline">{t('Your documents', 'आपके दस्तावेज़')}</p>
          <h1>{t('Everything in one place', 'सब कुछ एक जगह')}</h1>
          <p>
            {t(
              'Download the fictional documents created during your demo journey.',
              'अपनी डेमो प्रक्रिया में बने काल्पनिक दस्तावेज़ डाउनलोड करें।',
            )}
          </p>
        </div>
        <section className="downloads-card">
          {[
            {
              icon: ReceiptText,
              title: t('Renewal fee receipt', 'नवीनीकरण शुल्क रसीद'),
              note: t('Mock payment · ₹600', 'डेमो भुगतान · ₹600'),
              file: 'Renewal receipt',
            },
            {
              icon: CalendarDays,
              title: t('Appointment slip', 'अपॉइंटमेंट स्लिप'),
              note: t('14 Sep 2026 · 09:30 AM', '14 सितंबर 2026 · 09:30 AM'),
              file: 'Appointment slip',
            },
            {
              icon: FileText,
              title: t('Application summary', 'आवेदन सारांश'),
              note: APPLICATION_ID,
              file: 'Application summary',
            },
          ].map((document) => {
            const Icon = document.icon
            return (
              <div className="download-row" key={document.file}>
                <span className="download-icon">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <div>
                  <strong>{document.title}</strong>
                  <span>{document.note}</span>
                </div>
                <button
                  className="button secondary icon-button"
                  onClick={() => downloadDocument(document.file)}
                  aria-label={`${t('Download', 'डाउनलोड')} ${document.title}`}
                >
                  <Download size={18} aria-hidden="true" />
                  <span>{t('Download', 'डाउनलोड')}</span>
                </button>
              </div>
            )
          })}
          <div className="panel-note document-disclaimer">
            <Info size={18} aria-hidden="true" />
            <p>
              {t(
                'Downloads are plain-text demo files, not government-issued documents.',
                'डाउनलोड केवल डेमो टेक्स्ट फ़ाइलें हैं, सरकारी दस्तावेज़ नहीं।',
              )}
            </p>
          </div>
        </section>
      </div>
    </main>
  )

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {t('Skip to main content', 'मुख्य सामग्री पर जाएँ')}
      </a>
      <div className="prototype-banner">
        <span className="prototype-dot" />
        {t(
          'Independent hackathon prototype · Fictional data · Not affiliated with any government body',
          'स्वतंत्र हैकाथॉन प्रोटोटाइप · काल्पनिक डेटा · किसी सरकारी संस्था से संबद्ध नहीं',
        )}
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <button className="brand" onClick={() => navigate('home')}>
            <span className="brand-mark" aria-hidden="true">
              र
            </span>
            <span>
              <strong>Raahi</strong>
              <small>
                {t(
                  'Road Transport Citizen Services',
                  'सड़क परिवहन नागरिक सेवा',
                )}
              </small>
            </span>
          </button>
          <nav aria-label="Primary navigation">
            <button
              className={view === 'home' ? 'active' : ''}
              onClick={() => navigate('home')}
            >
              <Home size={17} aria-hidden="true" />
              {t('Home', 'होम')}
            </button>
            <button
              className={view === 'track' ? 'active' : ''}
              onClick={() => navigate('track')}
            >
              {t('Track', 'ट्रैक')}
            </button>
            <button
              className={view === 'appointment' ? 'active' : ''}
              onClick={() => navigate('appointment')}
            >
              {t('Appointments', 'अपॉइंटमेंट')}
            </button>
            <button
              className={view === 'documents' ? 'active' : ''}
              onClick={() => navigate('documents')}
            >
              {t('Documents', 'दस्तावेज़')}
            </button>
          </nav>
          <div className="header-actions">
            <div className="language-control" aria-label="Choose language">
              <Languages size={17} aria-hidden="true" />
              <button
                className={language === 'en' ? 'active' : ''}
                onClick={() => setLanguage('en')}
                aria-pressed={language === 'en'}
              >
                EN
              </button>
              <span aria-hidden="true">/</span>
              <button
                className={language === 'hi' ? 'active' : ''}
                onClick={() => setLanguage('hi')}
                aria-pressed={language === 'hi'}
              >
                हिंदी
              </button>
            </div>
            <button
              className="sign-out-button"
              onClick={signOut}
              aria-label={t('Sign out', 'साइन आउट')}
            >
              <LogOut size={17} aria-hidden="true" />
              <span>{t('Sign out', 'साइन आउट')}</span>
            </button>
          </div>
        </div>
      </header>
      <div className="department-ribbon">
        <div className="container">
          <span>{t('सड़क परिवहन नागरिक सेवा', 'Road Transport Citizen Services')}</span>
          <span>
            {t(
              'Licence · Vehicle · eChallan · RTO · Permit',
              'लाइसेंस · वाहन · ई-चालान · RTO · परमिट',
            )}
          </span>
        </div>
      </div>

      {view === 'home' && renderHome()}
      {view === 'renew' && renderRenewal()}
      {view === 'track' && renderTrack()}
      {view === 'documents' && renderDocuments()}
      {view === 'road-ready' && (
        <RoadReadyView
          t={t}
          centre={selectedCentre}
          appointmentDate={selectedDate}
          onBack={() => navigate('home')}
          onManageAppointment={(appointment) => {
            setSelectedCentre(appointment.centre)
            setSelectedDate(appointment.date)
            setAppointmentOverride({
              date: appointment.date,
              time: selectedSlot,
              centre: appointment.centre,
            })
            navigate('appointment')
          }}
        />
      )}
      {view === 'new-licence' && (
        <NewLicenceView
          t={t}
          centre={selectedCentre}
          onBack={() => navigate('home')}
          onFindRto={() => {
            setRtoReturnView('new-licence')
            navigate('rto')
          }}
        />
      )}
      {view === 'appointment' && (
        <AppointmentManagerView
          t={t}
          appointment={
            appointmentOverride ?? {
              date: application?.appointmentDate ?? selectedDate,
              time: application?.appointmentTime ?? selectedSlot,
              centre: application?.centre ?? selectedCentre,
            }
          }
          onBack={() => navigate('home')}
          onUpdate={updateAppointment}
        />
      )}
      {view === 'challan' && (
        <ChallanView
          t={t}
          onBack={() => navigate('home')}
          onDownloadReceipt={downloadChallanReceipt}
        />
      )}
      {view === 'rto' && (
        <RtoFinderView
          t={t}
          onBack={() => navigate('home')}
          onSelectCentre={setSelectedCentre}
          onStartRenewal={() => {
            if (rtoReturnView === 'new-licence') {
              navigate('new-licence')
              return
            }
            startFresh()
          }}
        />
      )}

      <footer>
        <div className="container footer-inner">
          <div className="footer-brand">
            <span className="brand-mark small" aria-hidden="true">
              र
            </span>
            <div>
              <strong>Raahi</strong>
              <p>
                {t(
                  'A simpler way through public services.',
                  'सार्वजनिक सेवाओं का आसान रास्ता।',
                )}
              </p>
            </div>
          </div>
          <div className="footer-note">
            <ShieldCheck size={18} aria-hidden="true" />
            <p>
              {t(
                'Prototype only. No live systems, personal information or payments.',
                'केवल प्रोटोटाइप। कोई लाइव सिस्टम, निजी जानकारी या भुगतान नहीं।',
              )}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
