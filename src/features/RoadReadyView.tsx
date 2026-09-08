import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Download,
  FileSearch,
  Info,
  Languages,
  LockKeyhole,
  MapPin,
  PlayCircle,
  Route,
  ShieldCheck,
  Sparkles,
  UserCheck,
  WalletCards,
  Wrench,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { getAppointmentExpiryIso } from '../demoSchedule'
import { getRtoCentre } from '../rtoData'

type Translate = (english: string, hindi: string) => string

type RoadReadyViewProps = {
  t: Translate
  centre: string
  appointmentDate: string
  onBack: () => void
  onManageAppointment: (appointment: {
    centre: string
    date: string
  }) => void
}

type Stage = 'intent' | 'plan' | 'preflight' | 'pass'

const defaultIntent =
  'My licence expires next month and I moved to a new address. Check any challans before I visit.'

const PASS_STORAGE_KEY = 'raahi-roadready-pass'
const PASS_ID = 'RR-0908-41'

type StoredRoadReadyPass = {
  version: 2
  passId: string
  intent: string
  services: string[]
  centre: string
  appointmentDate: string
  expiresAt: string
  visitTwinVerified: true
  preventedFailure: boolean
}

const readStoredPass = (): StoredRoadReadyPass | null => {
  try {
    const stored = localStorage.getItem(PASS_STORAGE_KEY)
    if (!stored) return null

    const pass = JSON.parse(stored) as Partial<StoredRoadReadyPass>
    if (
      pass.version !== 2 ||
      pass.visitTwinVerified !== true ||
      pass.passId !== PASS_ID ||
      typeof pass.preventedFailure !== 'boolean' ||
      typeof pass.centre !== 'string' ||
      typeof pass.appointmentDate !== 'string' ||
      typeof pass.expiresAt !== 'string' ||
      Date.parse(pass.expiresAt) <= Date.now() ||
      !Array.isArray(pass.services)
    ) {
      return null
    }

    const centre = getRtoCentre(pass.centre)
    const supportsPlan =
      (!pass.services.includes('renew') ||
        centre.services.includes('Driving licence renewal')) &&
      (!pass.services.includes('address') ||
        centre.services.includes('Address change'))

    return supportsPlan ? (pass as StoredRoadReadyPass) : null
  } catch {
    return null
  }
}

export function RoadReadyView({
  t,
  centre,
  appointmentDate,
  onBack,
  onManageAppointment,
}: RoadReadyViewProps) {
  const savedPass = readStoredPass()
  const passCentre = savedPass?.centre ?? centre
  const passAppointmentDate = savedPass?.appointmentDate ?? appointmentDate
  const passExpiry =
    savedPass?.expiresAt ?? getAppointmentExpiryIso(appointmentDate)
  const [stage, setStage] = useState<Stage>(savedPass ? 'pass' : 'intent')
  const [intent, setIntent] = useState(savedPass?.intent ?? defaultIntent)
  const [nameMismatchResolved, setNameMismatchResolved] = useState(
    savedPass?.preventedFailure ?? false,
  )
  const [shareStatus, setShareStatus] = useState('')
  const replayHeadingRef = useRef<HTMLHeadingElement>(null)

  const services = useMemo(() => {
    const normalized = intent.toLowerCase()
    const detected: Array<{
      id: string
      title: string
      reason: string
      dependency: string
    }> = []

    if (
      normalized.includes('expire') ||
      normalized.includes('renew') ||
      normalized.includes('licence')
    ) {
      detected.push({
        id: 'renew',
        title: t('Renew driving licence', 'ड्राइविंग लाइसेंस नवीनीकरण'),
        reason: t('Licence expires within 30 days', 'लाइसेंस 30 दिनों में समाप्त होगा'),
        dependency: t('Main service', 'मुख्य सेवा'),
      })
    }

    if (normalized.includes('address') || normalized.includes('moved')) {
      detected.push({
        id: 'address',
        title: t('Update address', 'पता अपडेट करें'),
        reason: t('Address changed since issue', 'लाइसेंस जारी होने के बाद पता बदला'),
        dependency: t('Bundle with renewal', 'नवीनीकरण के साथ जोड़ें'),
      })
    }

    if (normalized.includes('challan') || normalized.includes('fine')) {
      detected.push({
        id: 'challan',
        title: t('Clear pending challan', 'लंबित चालान निपटाएँ'),
        reason: t('Check before appointment', 'अपॉइंटमेंट से पहले जाँचें'),
        dependency: t('Complete first', 'पहले पूरा करें'),
      })
    }

    return detected.length
      ? detected
      : [
          {
            id: 'guide',
            title: t('Find the right road service', 'सही सड़क सेवा खोजें'),
            reason: t('Your request needs clarification', 'आपके अनुरोध में अधिक जानकारी चाहिए'),
            dependency: t('Guided service', 'निर्देशित सेवा'),
          },
        ]
  }, [intent, t])

  const hasAddressUpdate = services.some((service) => service.id === 'address')
  const hasChallanClearance = services.some((service) => service.id === 'challan')
  const hasRenewal = services.some((service) => service.id === 'renew')
  const preventedFailure = hasAddressUpdate && nameMismatchResolved
  const centreDetails = getRtoCentre(passCentre)
  const centreSupportsAddress =
    !hasAddressUpdate || centreDetails.services.includes('Address change')
  const centreSupportsRenewal =
    !hasRenewal || centreDetails.services.includes('Driving licence renewal')
  const centreSupportsPlan = centreSupportsAddress && centreSupportsRenewal
  const isVisitReady =
    (!hasAddressUpdate || nameMismatchResolved) && centreSupportsPlan

  const preflightChecks = [
    {
      title: t('Current licence', 'वर्तमान लाइसेंस'),
      note: t('Valid and readable', 'मान्य और स्पष्ट'),
      passed: true,
    },
    {
      title: t('Address proof', 'पता प्रमाण'),
      note: t('Current and accepted', 'वर्तमान और स्वीकृत'),
      passed: true,
    },
    {
      title: t('Photo quality', 'फोटो गुणवत्ता'),
      note: t('Face and background clear', 'चेहरा और पृष्ठभूमि स्पष्ट'),
      passed: true,
    },
    ...(hasAddressUpdate
      ? [
          {
            title: t('Name consistency', 'नाम की समानता'),
            note: nameMismatchResolved
              ? t('Resolved across this application', 'इस आवेदन में हल किया गया')
              : t(
                  '“Aarav K Mehta” differs from “Aarav Kumar Mehta”',
                  '“Aarav K Mehta” और “Aarav Kumar Mehta” अलग हैं',
                ),
            passed: nameMismatchResolved,
          },
        ]
      : []),
    ...(!centreSupportsPlan
      ? [
          {
            title: t('Centre capability', 'केंद्र क्षमता'),
            note: t(
              `${passCentre} does not support every in-person service in this plan`,
              `${passCentre} इस योजना की सभी व्यक्तिगत सेवाएँ प्रदान नहीं करता`,
            ),
            passed: false,
          },
        ]
      : []),
  ]

  const visitSimulationSteps = [
    {
      title: t('Entry verification', 'प्रवेश सत्यापन'),
      note: t('Licence and appointment details match', 'लाइसेंस और अपॉइंटमेंट विवरण मेल खाते हैं'),
      status: 'passed',
    },
    ...(hasAddressUpdate
      ? [
          {
            title: t('Address update counter', 'पता अपडेट काउंटर'),
            note: nameMismatchResolved
              ? centreSupportsAddress
                ? t('Expanded name accepted with consent', 'पूरा नाम सहमति के साथ स्वीकार हुआ')
                : t(
                    'Selected centre does not offer address changes',
                    'चुना गया केंद्र पता परिवर्तन नहीं करता',
                  )
              : t('Name mismatch would stop the application', 'नाम की असमानता आवेदन रोक देती'),
            status:
              nameMismatchResolved && centreSupportsAddress
                ? 'passed'
                : 'blocked',
          },
        ]
      : []),
    ...(hasChallanClearance
      ? [
          {
            title: t('Challan clearance desk', 'चालान निपटान डेस्क'),
            note: isVisitReady
              ? t('Clearance is linked to the combined plan', 'निपटान संयुक्त योजना से जुड़ा है')
              : t('Waiting for identity consistency', 'पहचान की समानता की प्रतीक्षा'),
            status: isVisitReady ? 'passed' : 'waiting',
          },
        ]
      : []),
    ...(hasRenewal
      ? [
          {
            title: t('Renewal approval', 'नवीनीकरण स्वीकृति'),
            note: isVisitReady
              ? t(
                  hasAddressUpdate
                    ? 'Renewal and address update accepted together'
                    : 'Renewal application is ready for approval',
                  hasAddressUpdate
                    ? 'नवीनीकरण और पता अपडेट साथ स्वीकार हुए'
                    : 'नवीनीकरण आवेदन स्वीकृति के लिए तैयार है',
                )
              : t('One-visit token cannot be issued yet', 'एक-यात्रा टोकन अभी जारी नहीं हो सकता'),
            status: isVisitReady ? 'passed' : 'waiting',
          },
        ]
      : []),
    ...(!hasAddressUpdate && !hasChallanClearance && !hasRenewal
      ? [
          {
            title: t('Guided service desk', 'निर्देशित सेवा डेस्क'),
            note: t('A specialist can clarify the requested outcome', 'विशेषज्ञ अनुरोध को स्पष्ट कर सकता है'),
            status: 'passed',
          },
        ]
      : []),
  ] as const

  const qrPayload = useMemo(
    () =>
      JSON.stringify({
        type: 'RAAHI_ROAD_READY_V2',
        passId: PASS_ID,
        checksPassed: preflightChecks.length,
        services: services.map((service) => {
          if (service.id === 'renew') return 'DL_RENEWAL'
          if (service.id === 'address') return 'ADDRESS_UPDATE'
          if (service.id === 'challan') return 'CHALLAN_CLEARANCE'
          return 'GUIDED_SERVICE'
        }),
        centre: passCentre,
        appointmentDate: passAppointmentDate,
        expiresAt: passExpiry,
        visitTwinVerified: true,
        preventedFailure,
        synthetic: true,
      }),
    [
      passAppointmentDate,
      passCentre,
      passExpiry,
      preflightChecks.length,
      preventedFailure,
      services,
    ],
  )

  useEffect(() => {
    if (nameMismatchResolved) {
      replayHeadingRef.current?.focus()
    }
  }, [nameMismatchResolved])

  const buildPlan = () => {
    if (!intent.trim()) return
    setStage('plan')
  }

  const generatePass = () => {
    const pass: StoredRoadReadyPass = {
      version: 2,
      passId: PASS_ID,
      intent,
      services: services.map((service) => service.id),
      centre,
      appointmentDate,
      expiresAt: getAppointmentExpiryIso(appointmentDate),
      visitTwinVerified: true,
      preventedFailure,
    }
    localStorage.setItem(PASS_STORAGE_KEY, JSON.stringify(pass))
    localStorage.setItem('raahi-roadready-intent', intent)
    setStage('pass')
  }

  const resetPass = () => {
    localStorage.removeItem(PASS_STORAGE_KEY)
    localStorage.removeItem('raahi-roadready-intent')
    setNameMismatchResolved(false)
    setShareStatus('')
    setStage('intent')
  }

  const downloadPass = () => {
    const content = [
      'ROADREADY ONE-VISIT PASS',
      'Independent hackathon prototype — synthetic data',
      '',
      `Pass: ${PASS_ID}`,
      'Readiness: 100%',
      `Checks passed: ${preflightChecks.length}`,
      `Centre: ${passCentre}`,
      `Services: ${services.map((service) => service.title).join(', ')}`,
      `Valid through appointment: ${passAppointmentDate}`,
      '',
      'This pass shares readiness status only. It does not contain document numbers.',
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'roadready-one-visit-pass.txt'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const sharePass = async () => {
    const text = `RoadReady Pass ${PASS_ID} · ${passCentre} · Ready for one visit`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'RoadReady Pass', text })
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      }
      setShareStatus(t('Pass ready to share', 'पास साझा करने के लिए तैयार है'))
    } catch {
      setShareStatus(t('Pass ready to share', 'पास साझा करने के लिए तैयार है'))
    }
  }

  return (
    <main id="main-content" className="inner-page roadready-page">
      <div className="container wide-tool-container">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={18} aria-hidden="true" />
          {t('Back to services', 'सेवाओं पर वापस जाएँ')}
        </button>

        {stage !== 'pass' && (
          <div className="roadready-header">
            <div>
              <p className="overline">{t('RoadReady · One-Visit Pass', 'RoadReady · एक-यात्रा पास')}</p>
              <h1>{t('One visit. Everything ready.', 'एक यात्रा। सब कुछ तैयार।')}</h1>
              <p>
                {t(
                  'Describe the outcome once. Raahi bundles the services, checks dependencies and catches document issues before you travel.',
                  'अपना लक्ष्य एक बार बताएँ। राही सेवाओं को जोड़ता है, निर्भरताएँ जाँचता है और यात्रा से पहले दस्तावेज़ समस्याएँ पकड़ता है।',
                )}
              </p>
            </div>
            <div className="one-visit-outcome">
              <span>{t('Target outcome', 'लक्षित परिणाम')}</span>
              <strong>{t('1 successful visit', '1 सफल यात्रा')}</strong>
              <small>{t('instead of repeated RTO trips', 'बार-बार RTO जाने के बजाय')}</small>
            </div>
          </div>
        )}

        {stage === 'intent' && (
          <section className="tool-card roadready-intent-card">
            <div className="intent-layout">
              <div>
                <label className="field">
                  <span>{t('What do you need to get done?', 'आपको क्या काम पूरा करना है?')}</span>
                  <textarea
                    value={intent}
                    onChange={(event) => setIntent(event.target.value)}
                    rows={5}
                    aria-label={t(
                      'What do you need to get done?',
                      'आपको क्या काम पूरा करना है?',
                    )}
                  />
                  <small>
                    {t(
                      'Use everyday language. You do not need to know a form or department.',
                      'सामान्य भाषा का उपयोग करें। फ़ॉर्म या विभाग जानना आवश्यक नहीं है।',
                    )}
                  </small>
                </label>
                <div className="intent-language-row">
                  <Languages size={16} aria-hidden="true" />
                  <span>{t('Understands English and Hindi intent', 'अंग्रेज़ी और हिंदी अनुरोध समझता है')}</span>
                </div>
              </div>
              <aside className="intent-example">
                <Sparkles size={22} aria-hidden="true" />
                <p className="overline">{t('Why this is different', 'यह अलग क्यों है')}</p>
                <h2>{t('Ask for an outcome, not a portal.', 'पोर्टल नहीं, अपना लक्ष्य बताएँ।')}</h2>
                <p>
                  {t(
                    'A citizen should not need to understand which database, form or office owns each part of one life event.',
                    'नागरिक को यह जानना आवश्यक नहीं होना चाहिए कि एक काम का कौन-सा भाग किस डेटाबेस, फ़ॉर्म या कार्यालय का है।',
                  )}
                </p>
              </aside>
            </div>
            <div className="roadready-actions">
              <span>
                <LockKeyhole size={16} aria-hidden="true" />
                {t('Intent stays on this device', 'अनुरोध इसी डिवाइस पर रहता है')}
              </span>
              <button className="button primary" onClick={buildPlan}>
                {t('Build my one-visit plan', 'मेरी एक-यात्रा योजना बनाएँ')}
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
          </section>
        )}

        {stage === 'plan' && (
          <section className="tool-card">
            <div className="stage-heading">
              <span className="stage-icon">
                <Route size={24} aria-hidden="true" />
              </span>
              <div>
                <p className="overline">{t('Intent translated into services', 'अनुरोध को सेवाओं में बदला गया')}</p>
                <h2>{t('Your combined journey', 'आपकी संयुक्त प्रक्रिया')}</h2>
                <p>
                  {t(
                    `${services.length} linked tasks arranged in the order that avoids a failed visit.`,
                    `${services.length} जुड़े काम उस क्रम में लगाए गए हैं जिससे यात्रा विफल न हो।`,
                  )}
                </p>
              </div>
            </div>

            <div className="combined-journey">
              {services.map((service, index) => (
                <div className="journey-service" key={service.id}>
                  <span className="journey-order">{index + 1}</span>
                  <div>
                    <strong>{service.title}</strong>
                    <p>{service.reason}</p>
                  </div>
                  <span className="dependency-pill">{service.dependency}</span>
                </div>
              ))}
              <div className="journey-service final">
                <span className="journey-order">
                  <MapPin size={15} aria-hidden="true" />
                </span>
                <div>
                  <strong>{t('One coordinated RTO visit', 'एक समन्वित RTO यात्रा')}</strong>
                  <p>{centre}</p>
                </div>
                <span className="dependency-pill">{t('Final step', 'अंतिम कदम')}</span>
              </div>
            </div>

            <div className="journey-impact">
              <div>
                <span>{t('Separate forms', 'अलग फ़ॉर्म')}</span>
                <strong>3 → 1</strong>
              </div>
              <div>
                <span>{t('Repeated fields', 'दोहराए गए फ़ील्ड')}</span>
                <strong>22 → 7</strong>
              </div>
              <div>
                <span>{t('Expected visits', 'अनुमानित यात्राएँ')}</span>
                <strong>3 → 1</strong>
              </div>
            </div>

            <div className="roadready-actions">
              <button className="button ghost" onClick={() => setStage('intent')}>
                <ArrowLeft size={18} aria-hidden="true" />
                {t('Edit request', 'अनुरोध बदलें')}
              </button>
              <button className="button primary" onClick={() => setStage('preflight')}>
                <PlayCircle size={18} aria-hidden="true" />
                {t('Simulate my RTO visit', 'मेरी RTO यात्रा सिम्युलेट करें')}
              </button>
            </div>
          </section>
        )}

        {stage === 'preflight' && (
          <section className="tool-card">
            <div className="preflight-topline">
              <div className={`readiness-score ${isVisitReady ? 'ready' : ''}`}>
                <strong>{isVisitReady ? '100' : '82'}</strong>
                <span>{t('Ready score', 'तैयारी स्कोर')}</span>
              </div>
              <div className="stage-heading">
                <span className="stage-icon">
                  <FileSearch size={24} aria-hidden="true" />
                </span>
                <div>
                  <p className="overline">{t('VisitTwin · pre-visit simulation', 'VisitTwin · यात्रा-पूर्व सिम्युलेशन')}</p>
                  <h2>
                    {isVisitReady
                      ? t('Your one-visit route is clear', 'आपकी एक-यात्रा प्रक्रिया तैयार है')
                      : t('Your visit would stop at counter 2', 'आपकी यात्रा काउंटर 2 पर रुक जाती')}
                  </h2>
                  <p>
                    {t(
                      'Raahi rehearses the complete visit and explains the exact failure point before you travel.',
                      'राही पूरी यात्रा का अभ्यास करता है और जाने से पहले विफलता का सटीक स्थान समझाता है।',
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="preflight-checks">
              {preflightChecks.map((check) => (
                <div className={`preflight-check ${check.passed ? 'passed' : 'issue'}`} key={check.title}>
                  <span>
                    {check.passed ? (
                      <Check size={17} aria-hidden="true" />
                    ) : (
                      <Wrench size={17} aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <strong>{check.title}</strong>
                    <p>{check.note}</p>
                  </div>
                  <small>{check.passed ? t('Passed', 'पास') : t('Action needed', 'कार्रवाई आवश्यक')}</small>
                </div>
              ))}
            </div>

            <div className={`visit-twin ${isVisitReady ? 'cleared' : 'blocked'}`}>
              <div className="visit-twin-heading">
                <span>
                  {isVisitReady ? (
                    <PlayCircle size={22} aria-hidden="true" />
                  ) : (
                    <CircleAlert size={22} aria-hidden="true" />
                  )}
                </span>
                <div>
                  <p className="overline">{t('Digital rehearsal', 'डिजिटल अभ्यास')}</p>
                  <h3 ref={replayHeadingRef} tabIndex={-1}>
                    {isVisitReady
                      ? t('Successful visit replay', 'सफल यात्रा का रीप्ले')
                      : t('Failure forecast', 'विफलता का पूर्वानुमान')}
                  </h3>
                </div>
                <strong>
                  {isVisitReady
                    ? t(
                        `${visitSimulationSteps.length} counters clear`,
                        `${visitSimulationSteps.length} काउंटर तैयार`,
                      )
                    : t('Second visit likely', 'दूसरी यात्रा संभव')}
                </strong>
              </div>

              <div className="visit-twin-route">
                {visitSimulationSteps.map((simulationStep, index) => (
                  <div
                    className={`visit-twin-step ${simulationStep.status}`}
                    key={simulationStep.title}
                    style={{ '--visit-step': index } as CSSProperties}
                  >
                    <span className="visit-twin-node">
                      {simulationStep.status === 'passed' ? (
                        <Check size={15} aria-hidden="true" />
                      ) : simulationStep.status === 'blocked' ? (
                        <CircleAlert size={15} aria-hidden="true" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <div>
                      <small>{t(`Counter ${index + 1}`, `काउंटर ${index + 1}`)}</small>
                      <strong>{simulationStep.title}</strong>
                      <p>{simulationStep.note}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="visit-twin-impact">
                <Building2 size={18} aria-hidden="true" />
                <div>
                  <strong>
                    {preventedFailure
                      ? t('One failure prevented before leaving home', 'घर से निकलने से पहले एक विफलता रोकी गई')
                      : isVisitReady
                        ? t('No blocking handoff found in this journey', 'इस प्रक्रिया में कोई रुकावट नहीं मिली')
                      : t('Without this check: return home, correct records, book again', 'इस जाँच के बिना: घर लौटें, रिकॉर्ड सुधारें, फिर बुक करें')}
                  </strong>
                  <span>
                    {preventedFailure
                      ? t('The same correction now flows through every linked service.', 'यही सुधार अब हर जुड़ी सेवा में लागू है।')
                      : isVisitReady
                        ? t('Every requested service can proceed in one coordinated visit.', 'हर अनुरोधित सेवा एक समन्वित यात्रा में आगे बढ़ सकती है।')
                      : t('VisitTwin shows the consequence, not just a warning.', 'VisitTwin केवल चेतावनी नहीं, उसका परिणाम दिखाता है।')}
                  </span>
                </div>
              </div>

              {hasAddressUpdate && (
                <div
                  className={`visit-cost-ledger ${
                    preventedFailure ? 'saved' : 'at-risk'
                  }`}
                  aria-label={t(
                    preventedFailure
                      ? 'Illustrative cost prevented'
                      : 'Illustrative cost of the predicted failed visit',
                    preventedFailure
                      ? 'रोकी गई अनुमानित लागत'
                      : 'अनुमानित विफल यात्रा की लागत',
                  )}
                >
                  <div className="visit-cost-ledger-heading">
                    <span>
                      {preventedFailure
                        ? t('Visit cost prevented', 'यात्रा लागत रोकी गई')
                        : t('If the citizen travelled now', 'यदि नागरिक अभी यात्रा करे')}
                    </span>
                    <small>{t('Illustrative synthetic scenario', 'काल्पनिक उदाहरण')}</small>
                  </div>
                  <div className="visit-cost-ledger-items">
                    {[
                      {
                        value: '1',
                        label: t('workday', 'कार्यदिवस'),
                      },
                      {
                        value: '28 km',
                        label: t('return trip', 'वापसी यात्रा'),
                      },
                      {
                        value: '11 days',
                        label: t('to next slot', 'अगले स्लॉट तक'),
                      },
                    ].map((cost) => (
                      <div key={cost.label}>
                        <strong>{cost.value}</strong>
                        <span>{cost.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {!nameMismatchResolved && hasAddressUpdate ? (
              <div className="resolution-card">
                <Info size={20} aria-hidden="true" />
                <div>
                  <strong>{t('Resolve without another visit', 'अतिरिक्त यात्रा के बिना हल करें')}</strong>
                  <p>
                    {t(
                      'Use the expanded name from the fictional address proof consistently across the combined application.',
                      'संयुक्त आवेदन में काल्पनिक पता प्रमाण का पूरा नाम समान रूप से उपयोग करें।',
                    )}
                  </p>
                </div>
                <button className="button primary" onClick={() => setNameMismatchResolved(true)}>
                  {t('Resolve name mismatch', 'नाम की असमानता हल करें')}
                </button>
              </div>
            ) : !centreSupportsPlan ? (
              <div className="resolution-card">
                <Info size={20} aria-hidden="true" />
                <div>
                  <strong>
                    {t(
                      'Choose a centre that supports the full plan',
                      'पूरी योजना वाला केंद्र चुनें',
                    )}
                  </strong>
                  <p>
                    {t(
                      'RTO Dwarka and RTO Vasant Vihar support both renewal and address change in this demo.',
                      'इस डेमो में RTO द्वारका और RTO वसंत विहार नवीनीकरण और पता परिवर्तन दोनों करते हैं।',
                    )}
                  </p>
                </div>
                <button className="button primary" onClick={onBack}>
                  {t('Choose another RTO', 'दूसरा RTO चुनें')}
                </button>
              </div>
            ) : (
              <div className="roadready-actions">
                <span className="ready-message" role="status" aria-live="polite">
                  <CheckCircle2 size={18} aria-hidden="true" />
                  {t(
                    `VisitTwin replay complete · all ${visitSimulationSteps.length} counters clear`,
                    `VisitTwin रीप्ले पूरा · सभी ${visitSimulationSteps.length} काउंटर तैयार`,
                  )}
                </span>
                <button className="button primary" onClick={generatePass}>
                  <BadgeCheck size={18} aria-hidden="true" />
                  {t('Generate RoadReady Pass', 'RoadReady पास बनाएँ')}
                </button>
              </div>
            )}
          </section>
        )}

        {stage === 'pass' && (
          <section className="roadready-pass-layout">
            <div className="roadready-pass">
              <div className="pass-header">
                <div>
                  <p>RAAHI</p>
                  <h1>{t('Your RoadReady Pass', 'आपका RoadReady पास')}</h1>
                </div>
                <span>
                  <BadgeCheck size={19} aria-hidden="true" />
                  {t('Visit ready', 'यात्रा के लिए तैयार')}
                </span>
              </div>

              <div className="pass-body">
                <div className="qr-wrap">
                  <QRCodeSVG
                    value={qrPayload}
                    size={174}
                    level="M"
                    marginSize={2}
                    role="img"
                    aria-label="RoadReady verification QR code"
                  />
                  <small>{PASS_ID}</small>
                </div>
                <div className="pass-summary">
                  <span className="pass-score">100%</span>
                  <h2>
                    {t(
                      `${preflightChecks.length} checks passed`,
                      `${preflightChecks.length} जाँच पास`,
                    )}
                  </h2>
                  <p>
                    {t(
                      `${services.length} ${
                        services.length === 1 ? 'service' : 'services'
                      } bundled · 1 visit planned`,
                      `${services.length} सेवाएँ जोड़ी गईं · 1 यात्रा नियोजित`,
                    )}
                  </p>
                  <dl>
                    <div>
                      <dt>{t('Centre', 'केंद्र')}</dt>
                      <dd>{passCentre}</dd>
                    </div>
                    <div>
                      <dt>{t('Valid until', 'मान्य समय')}</dt>
                      <dd>{passAppointmentDate} · 8:30 PM</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="visit-twin-proof">
                <PlayCircle size={19} aria-hidden="true" />
                <div>
                  <strong>{t('Verified by VisitTwin', 'VisitTwin द्वारा सत्यापित')}</strong>
                  <p>
                    {preventedFailure
                      ? t(
                          `The full ${visitSimulationSteps.length}-counter journey was simulated after the correction: no blocked handoff, no duplicate form and no exposed document number.`,
                          `सुधार के बाद सभी ${visitSimulationSteps.length} काउंटर की यात्रा सिम्युलेट हुई: कोई रुका हस्तांतरण, दोहराया फ़ॉर्म या उजागर दस्तावेज़ नंबर नहीं।`,
                        )
                      : t(
                          `The full ${visitSimulationSteps.length}-counter journey was simulated with no blocked handoff, duplicate form or exposed document number.`,
                          `सभी ${visitSimulationSteps.length} काउंटर की यात्रा सिम्युलेट हुई: कोई रुका हस्तांतरण, दोहराया फ़ॉर्म या उजागर दस्तावेज़ नंबर नहीं।`,
                        )}
                  </p>
                </div>
                <span>
                  {preventedFailure
                    ? t('1 day + 1 trip saved', '1 दिन + 1 यात्रा बची')
                    : t('Route verified', 'प्रक्रिया सत्यापित')}
                </span>
              </div>

              <div className="pass-services">
                {services.map((service) => (
                  <span key={service.id}>
                    <Check size={13} aria-hidden="true" />
                    {service.title}
                  </span>
                ))}
              </div>

              <div className="pass-privacy">
                <ShieldCheck size={19} aria-hidden="true" />
                <div>
                  <strong>{t('Only readiness status is shared', 'केवल तैयारी स्थिति साझा होती है')}</strong>
                  <p>
                    {t(
                      'The QR contains no licence, address-proof or payment numbers. A desk sees which checks passed and the bundled services.',
                      'QR में लाइसेंस, पता प्रमाण या भुगतान नंबर नहीं हैं। काउंटर केवल पास हुई जाँच और संयुक्त सेवाएँ देखता है।',
                    )}
                  </p>
                </div>
              </div>
            </div>

            <aside className="pass-side-panel">
              <p className="overline">{t('One-visit toolkit', 'एक-यात्रा टूलकिट')}</p>
              <h2>{t('Take the plan with you', 'योजना अपने साथ रखें')}</h2>
              <div className="pass-action-list">
                <button onClick={downloadPass}>
                  <Download size={19} aria-hidden="true" />
                  <span>
                    <strong>{t('Download offline pass', 'ऑफ़लाइन पास डाउनलोड करें')}</strong>
                    <small>{t('Works if the portal is unavailable', 'पोर्टल उपलब्ध न हो तब भी')}</small>
                  </span>
                </button>
                <button onClick={sharePass}>
                  <UserCheck size={19} aria-hidden="true" />
                  <span>
                    <strong>{t('Share with a trusted helper', 'विश्वसनीय सहायक से साझा करें')}</strong>
                    <small>{t('Readiness only, not documents', 'केवल तैयारी, दस्तावेज़ नहीं')}</small>
                  </span>
                </button>
                <button
                  onClick={() =>
                    onManageAppointment({
                      centre: passCentre,
                      date: passAppointmentDate,
                    })
                  }
                >
                  <MapPin size={19} aria-hidden="true" />
                  <span>
                    <strong>{t('Manage visit and map', 'यात्रा और नक्शा प्रबंधित करें')}</strong>
                    <small>{passCentre}</small>
                  </span>
                </button>
              </div>

              <div className="consent-audit">
                <div>
                  <ClipboardCheck size={17} aria-hidden="true" />
                  <span>
                    <strong>{t('Consent recorded', 'सहमति दर्ज')}</strong>
                    <small>08 Sep · 8:31 PM</small>
                  </span>
                </div>
                <div>
                  <WalletCards size={17} aria-hidden="true" />
                  <span>
                    <strong>{t('Saved on this device', 'इस डिवाइस पर सुरक्षित')}</strong>
                    <small>{t('No central profile created', 'कोई केंद्रीय प्रोफ़ाइल नहीं बनी')}</small>
                  </span>
                </div>
              </div>

              {shareStatus && <div className="inline-status">{shareStatus}</div>}
              <button className="text-button pass-reset" onClick={resetPass}>
                {t('Create a different plan', 'दूसरी योजना बनाएँ')}
              </button>
            </aside>
          </section>
        )}
      </div>
    </main>
  )
}
