import { type FormEvent, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  FileCheck2,
  Info,
  MapPin,
  ShieldCheck,
  WalletCards,
} from 'lucide-react'

type Translate = (english: string, hindi: string) => string

type NewLicenceViewProps = {
  t: Translate
  centre: string
  onBack: () => void
  onFindRto: () => void
}

const learnerDates = [
  { value: '03 Sep 2026', label: 'Thursday, 03 September', day: '03', month: 'Sep' },
  { value: '04 Sep 2026', label: 'Friday, 04 September', day: '04', month: 'Sep' },
  { value: '07 Sep 2026', label: 'Monday, 07 September', day: '07', month: 'Sep' },
]

export function NewLicenceView({
  t,
  centre,
  onBack,
  onFindRto,
}: NewLicenceViewProps) {
  const previouslySubmitted =
    localStorage.getItem('raahi-new-licence-submitted') === 'true'
  const savedDraftStep = Number(
    sessionStorage.getItem('raahi-new-licence-draft-step'),
  )
  const [step, setStep] = useState(
    previouslySubmitted ? 5 : savedDraftStep === 4 ? 4 : 1,
  )
  const [dateOfBirth, setDateOfBirth] = useState('2001-06-18')
  const [state, setState] = useState('Delhi')
  const [vehicleClasses, setVehicleClasses] = useState({
    lmv: true,
    mcwg: false,
    mcwog: false,
  })
  const [documentsConfirmed, setDocumentsConfirmed] = useState(false)
  const [testDate, setTestDate] = useState('03 Sep 2026')
  const [testTime, setTestTime] = useState('10:00 AM')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const age = useMemo(() => {
    const birth = new Date(dateOfBirth)
    const today = new Date('2026-08-29')
    let value = today.getFullYear() - birth.getFullYear()
    if (
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() &&
        today.getDate() < birth.getDate())
    ) {
      value -= 1
    }
    return value
  }, [dateOfBirth])

  const checkEligibility = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!dateOfBirth || !state) {
      setError(t('Enter your date of birth and state.', 'जन्म तिथि और राज्य दर्ज करें।'))
      return
    }
    if (age < 18) {
      setError(
        t(
          'This demo journey requires the applicant to be at least 18.',
          'इस डेमो प्रक्रिया के लिए आवेदक की आयु कम से कम 18 वर्ष होनी चाहिए।',
        ),
      )
      return
    }
    setError('')
    setStep(2)
  }

  const continueFromClasses = () => {
    if (!Object.values(vehicleClasses).some(Boolean)) {
      setError(t('Choose at least one vehicle class.', 'कम से कम एक वाहन श्रेणी चुनें।'))
      return
    }
    setError('')
    setStep(3)
  }

  const continueFromDocuments = () => {
    if (!documentsConfirmed) {
      setError(
        t(
          'Review and confirm the document requirements.',
          'दस्तावेज़ आवश्यकताओं की समीक्षा और पुष्टि करें।',
        ),
      )
      return
    }
    setError('')
    setStep(4)
  }

  const submitApplication = () => {
    setLoading(true)
    window.setTimeout(() => {
      localStorage.setItem('raahi-new-licence-submitted', 'true')
      localStorage.setItem(
        'raahi-new-licence-appointment',
        JSON.stringify({ testDate, testTime, centre }),
      )
      sessionStorage.removeItem('raahi-new-licence-draft-step')
      setStep(5)
      setLoading(false)
    }, 650)
  }

  const restart = () => {
    localStorage.removeItem('raahi-new-licence-submitted')
    localStorage.removeItem('raahi-new-licence-appointment')
    sessionStorage.removeItem('raahi-new-licence-draft-step')
    setDocumentsConfirmed(false)
    setStep(1)
  }

  const progressLabels = [
    t('Eligibility', 'पात्रता'),
    t('Vehicle class', 'वाहन श्रेणी'),
    t('Documents', 'दस्तावेज़'),
    t('Test & fee', 'टेस्ट और शुल्क'),
  ]

  return (
    <main id="main-content" className="flow-page new-licence-page">
      <div className="container flow-container">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={18} aria-hidden="true" />
          {t('Back to services', 'सेवाओं पर वापस जाएँ')}
        </button>

        {step < 5 && (
          <div className="compact-progress" aria-label="Application progress">
            {progressLabels.map((label, index) => (
              <div
                className={`${index + 1 === step ? 'current' : ''} ${
                  index + 1 < step ? 'complete' : ''
                }`}
                key={label}
              >
                <span>{index + 1 < step ? <Check size={13} aria-hidden="true" /> : index + 1}</span>
                <small>{label}</small>
              </div>
            ))}
          </div>
        )}

        <section className={`form-card ${step === 5 ? 'success-card' : ''}`}>
          {step === 1 && (
            <>
              <div className="form-heading">
                <p className="overline">{t('First-time applicant', 'पहली बार आवेदन')}</p>
                <h1>{t('Apply for a new driving licence', 'नए ड्राइविंग लाइसेंस के लिए आवेदन करें')}</h1>
                <p>
                  {t(
                    "A first-time licence starts with a learner's licence. Raahi shows the complete path before you begin.",
                    'पहली बार लाइसेंस की प्रक्रिया लर्नर लाइसेंस से शुरू होती है। राही शुरू करने से पहले पूरा रास्ता दिखाता है।',
                  )}
                </p>
              </div>
              <div className="process-explainer">
                <div className="current">
                  <span>1</span>
                  <strong>{t("Apply for learner's licence", 'लर्नर लाइसेंस के लिए आवेदन')}</strong>
                </div>
                <ArrowRight size={16} aria-hidden="true" />
                <div>
                  <span>2</span>
                  <strong>{t('Practice period', 'अभ्यास अवधि')}</strong>
                </div>
                <ArrowRight size={16} aria-hidden="true" />
                <div>
                  <span>3</span>
                  <strong>{t('Driving test and licence', 'ड्राइविंग टेस्ट और लाइसेंस')}</strong>
                </div>
              </div>
              <form className="form-grid spaced" onSubmit={checkEligibility}>
                <label className="field">
                  <span>{t('Date of birth', 'जन्म तिथि')}</span>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(event) => {
                      setDateOfBirth(event.target.value)
                      setError('')
                    }}
                  />
                </label>
                <label className="field">
                  <span>{t('State of residence', 'निवास राज्य')}</span>
                  <select value={state} onChange={(event) => setState(event.target.value)}>
                    <option>Delhi</option>
                    <option>Karnataka</option>
                    <option>Maharashtra</option>
                    <option>Uttar Pradesh</option>
                  </select>
                </label>
                <div className="form-submit-row full">
                  <span>
                    <ShieldCheck size={16} aria-hidden="true" />
                    {t('Fictional applicant details', 'काल्पनिक आवेदक विवरण')}
                  </span>
                  <button className="button primary" type="submit">
                    {t('Check eligibility', 'पात्रता जाँचें')}
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-heading">
                <p className="overline">{t('Eligible to continue', 'आगे बढ़ने के लिए पात्र')}</p>
                <h1>{t('Choose vehicle classes', 'वाहन श्रेणियाँ चुनें')}</h1>
                <p>
                  {t(
                    `At age ${age}, you can apply for the selected private vehicle classes in this demo.`,
                    `${age} वर्ष की आयु में आप इस डेमो में चुनी गई निजी वाहन श्रेणियों के लिए आवेदन कर सकते हैं।`,
                  )}
                </p>
              </div>
              <div className="vehicle-class-list">
                {[
                  {
                    key: 'lmv' as const,
                    title: t('Light motor vehicle (LMV)', 'हल्का मोटर वाहन (LMV)'),
                    note: t('Private car or jeep', 'निजी कार या जीप'),
                  },
                  {
                    key: 'mcwg' as const,
                    title: t('Motorcycle with gear (MCWG)', 'गियर वाली मोटरसाइकिल (MCWG)'),
                    note: t('Motorcycle or scooter with gear', 'गियर वाली मोटरसाइकिल या स्कूटर'),
                  },
                  {
                    key: 'mcwog' as const,
                    title: t('Motorcycle without gear', 'बिना गियर की मोटरसाइकिल'),
                    note: t('Scooter without gear', 'बिना गियर का स्कूटर'),
                  },
                ].map((vehicleClass) => (
                  <label className="choice-card" key={vehicleClass.key}>
                    <input
                      type="checkbox"
                      checked={vehicleClasses[vehicleClass.key]}
                      onChange={(event) =>
                        setVehicleClasses((current) => ({
                          ...current,
                          [vehicleClass.key]: event.target.checked,
                        }))
                      }
                    />
                    <span>
                      <strong>{vehicleClass.title}</strong>
                      <small>{vehicleClass.note}</small>
                    </span>
                  </label>
                ))}
              </div>
              <div className="eligibility-card compact-card">
                <BadgeCheck size={22} aria-hidden="true" />
                <p>
                  {t(
                    "The learner's test will cover road signs, safety and traffic rules for your selected classes.",
                    'लर्नर टेस्ट में चुनी गई श्रेणियों के लिए सड़क संकेत, सुरक्षा और यातायात नियम शामिल होंगे।',
                  )}
                </p>
              </div>
              <div className="form-actions">
                <button className="button ghost" onClick={() => setStep(1)}>
                  <ArrowLeft size={18} aria-hidden="true" />
                  {t('Back', 'पीछे')}
                </button>
                <button className="button primary" onClick={continueFromClasses}>
                  {t('Continue', 'आगे बढ़ें')}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="form-heading">
                <p className="overline">{t('Personalised checklist', 'व्यक्तिगत चेकलिस्ट')}</p>
                <h1>{t('Documents for your application', 'आपके आवेदन के दस्तावेज़')}</h1>
                <p>
                  {t(
                    'Review what would be required before a production submission.',
                    'प्रोडक्शन आवेदन से पहले आवश्यक दस्तावेज़ देखें।',
                  )}
                </p>
              </div>
              <div className="document-list">
                {[
                  [t('Proof of age', 'आयु प्रमाण'), t('Birth certificate or Class 10 certificate', 'जन्म प्रमाणपत्र या कक्षा 10 प्रमाणपत्र')],
                  [t('Proof of address', 'पता प्रमाण'), t('One accepted current-address document', 'वर्तमान पते का एक स्वीकृत दस्तावेज़')],
                  [t('Photograph and signature', 'फोटो और हस्ताक्षर'), t('Captured during the assisted application', 'सहायता प्राप्त आवेदन के दौरान लिया जाएगा')],
                ].map(([title, note]) => (
                  <div className="document-row" key={title}>
                    <span className="document-icon">
                      <FileCheck2 size={21} aria-hidden="true" />
                    </span>
                    <div>
                      <strong>{title}</strong>
                      <p>{note}</p>
                    </div>
                    <span className="verified-pill">{t('Required', 'आवश्यक')}</span>
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
                      'I have reviewed the document requirements',
                      'मैंने दस्तावेज़ आवश्यकताओं की समीक्षा कर ली है',
                    )}
                  </strong>
                  <small>
                    {t(
                      'No real documents are uploaded in this prototype.',
                      'इस प्रोटोटाइप में असली दस्तावेज़ अपलोड नहीं होते।',
                    )}
                  </small>
                </span>
              </label>
              <div className="form-actions">
                <button className="button ghost" onClick={() => setStep(2)}>
                  <ArrowLeft size={18} aria-hidden="true" />
                  {t('Back', 'पीछे')}
                </button>
                <button className="button primary" onClick={continueFromDocuments}>
                  {t('Continue', 'आगे बढ़ें')}
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="form-heading">
                <p className="overline">{t('Test and application fee', 'टेस्ट और आवेदन शुल्क')}</p>
                <h1>{t("Book your learner's test", 'अपना लर्नर टेस्ट बुक करें')}</h1>
                <p>
                  {t(
                    'Choose a test slot and review the illustrative sandbox fee before submitting.',
                    'टेस्ट स्लॉट चुनें और आवेदन जमा करने से पहले डेमो शुल्क देखें।',
                  )}
                </p>
              </div>
              <div className="new-licence-booking">
                <div>
                  <div className="centre-card">
                    <span className="centre-icon">
                      <MapPin size={22} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="overline">{t('Test centre', 'टेस्ट केंद्र')}</p>
                      <strong>{centre}</strong>
                      <span>{t('Selected from your RTO preference', 'आपकी RTO पसंद से चुना गया')}</span>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => {
                        sessionStorage.setItem(
                          'raahi-new-licence-draft-step',
                          '4',
                        )
                        onFindRto()
                      }}
                    >
                      {t('Change', 'बदलें')}
                    </button>
                  </div>
                  <div className="selection-group">
                    <label>{t('Test date', 'टेस्ट तारीख')}</label>
                    <div className="date-options">
                      {learnerDates.map((date) => (
                        <button
                          key={date.value}
                          type="button"
                          aria-label={date.label}
                          className={testDate === date.value ? 'selected' : ''}
                          onClick={() => setTestDate(date.value)}
                        >
                          <strong>{date.day}</strong>
                          <small>{date.month}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="selection-group">
                    <label>{t('Test time', 'टेस्ट समय')}</label>
                    <div className="slot-options">
                      {['10:00 AM', '11:30 AM', '03:00 PM'].map((time) => (
                        <button
                          key={time}
                          type="button"
                          className={testTime === time ? 'selected' : ''}
                          onClick={() => setTestTime(time)}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <aside className="fee-card">
                  <p className="overline">{t('Illustrative fee', 'डेमो शुल्क')}</p>
                  <div>
                    <span>{t("Learner's licence", 'लर्नर लाइसेंस')}</span>
                    <strong>₹200</strong>
                  </div>
                  <div>
                    <span>{t('Knowledge test', 'ज्ञान परीक्षा')}</span>
                    <strong>₹150</strong>
                  </div>
                  <div className="fee-total">
                    <span>{t('Total', 'कुल')}</span>
                    <strong>₹350</strong>
                  </div>
                  <fieldset className="payment-methods">
                    <legend>{t('Sandbox payment', 'सैंडबॉक्स भुगतान')}</legend>
                    {['UPI', 'Card'].map((method) => (
                      <label key={method}>
                        <input
                          type="radio"
                          name="payment-method"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                        />
                        {method}
                      </label>
                    ))}
                  </fieldset>
                </aside>
              </div>
              <div className="action-notice">
                <Info size={18} aria-hidden="true" />
                <p>
                  {t(
                    'Fees vary by service and jurisdiction. This amount is illustrative and no payment credentials are collected.',
                    'शुल्क सेवा और क्षेत्र के अनुसार बदलता है। यह राशि केवल उदाहरण है और कोई भुगतान विवरण नहीं लिया जाता।',
                  )}
                </p>
              </div>
              <div className="form-actions">
                <button className="button ghost" onClick={() => setStep(3)}>
                  <ArrowLeft size={18} aria-hidden="true" />
                  {t('Back', 'पीछे')}
                </button>
                <button
                  className="button primary"
                  onClick={submitApplication}
                  disabled={loading}
                >
                  <WalletCards size={18} aria-hidden="true" />
                  {loading
                    ? t('Submitting…', 'जमा हो रहा है…')
                    : t('Pay ₹350 and submit', '₹350 भुगतान कर जमा करें')}
                </button>
              </div>
            </>
          )}

          {step === 5 && (
            <div className="success-view">
              <div className="success-mark">
                <CheckCircle2 size={37} aria-hidden="true" />
              </div>
              <p className="overline">{t('Learner-stage application', 'लर्नर चरण आवेदन')}</p>
              <h1>{t('Application submitted', 'आवेदन जमा हुआ')}</h1>
              <p className="success-description">
                {t(
                  "Your fictional learner's test is booked. The timeline below shows the remaining path to a permanent licence.",
                  'आपका काल्पनिक लर्नर टेस्ट बुक हो गया है। नीचे स्थायी लाइसेंस तक की बाकी प्रक्रिया दिखाई गई है।',
                )}
              </p>
              <div className="application-number">
                <span>{t('Application number', 'आवेदन नंबर')}</span>
                <strong>LL-2026-082941</strong>
              </div>
              <div className="licence-path">
                {[
                  [t("Learner's test", 'लर्नर टेस्ट'), `${testDate} · ${testTime}`],
                  [t("Learner's licence issued", 'लर्नर लाइसेंस जारी'), t('After passing the test', 'टेस्ट पास होने के बाद')],
                  [t('Practice period', 'अभ्यास अवधि'), t('At least 30 days', 'कम से कम 30 दिन')],
                  [t('Driving test', 'ड्राइविंग टेस्ट'), t('Book when eligible', 'पात्र होने पर बुक करें')],
                ].map(([title, note], index) => (
                  <div key={title}>
                    <span>{index + 1}</span>
                    <div>
                      <strong>{title}</strong>
                      <small>{note}</small>
                    </div>
                  </div>
                ))}
              </div>
              <div className="success-actions">
                <button className="button primary" onClick={onBack}>
                  {t('Return to services', 'सेवाओं पर लौटें')}
                </button>
                <button className="button secondary" onClick={restart}>
                  {t('Start another application', 'दूसरा आवेदन शुरू करें')}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message" role="alert">
              <Info size={18} aria-hidden="true" />
              {error}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
