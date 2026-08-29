import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileSearch,
  Info,
  Languages,
  LockKeyhole,
  MapPin,
  Route,
  ScanLine,
  ShieldCheck,
  Sparkles,
  UserCheck,
  WalletCards,
  Wrench,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

type Translate = (english: string, hindi: string) => string

type RoadReadyViewProps = {
  t: Translate
  centre: string
  onBack: () => void
  onManageAppointment: () => void
}

type Stage = 'intent' | 'plan' | 'preflight' | 'pass'

const defaultIntent =
  'My licence expires next month and I moved to a new address. Check any challans before I visit.'

const qrPayload = JSON.stringify({
  type: 'RAAHI_ROAD_READY_V1',
  passId: 'RR-0829-41',
  checksPassed: 4,
  services: ['DL_RENEWAL', 'ADDRESS_UPDATE', 'CHALLAN_CLEARANCE'],
  centre: 'RTO_DWARKA',
  expiresAt: '2026-08-30T20:30:00+05:30',
  synthetic: true,
})

export function RoadReadyView({
  t,
  centre,
  onBack,
  onManageAppointment,
}: RoadReadyViewProps) {
  const savedPass = localStorage.getItem('raahi-roadready-pass') === 'issued'
  const [stage, setStage] = useState<Stage>(savedPass ? 'pass' : 'intent')
  const [intent, setIntent] = useState(defaultIntent)
  const [nameMismatchResolved, setNameMismatchResolved] = useState(false)
  const [shareStatus, setShareStatus] = useState('')

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

  const buildPlan = () => {
    if (!intent.trim()) return
    setStage('plan')
  }

  const generatePass = () => {
    localStorage.setItem('raahi-roadready-pass', 'issued')
    localStorage.setItem('raahi-roadready-intent', intent)
    setStage('pass')
  }

  const resetPass = () => {
    localStorage.removeItem('raahi-roadready-pass')
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
      'Pass: RR-0829-41',
      'Readiness: 100%',
      'Checks passed: 4',
      `Centre: ${centre}`,
      'Services: Driving licence renewal, address update, challan clearance',
      'Valid until: 30 Aug 2026, 8:30 PM',
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
    const text = `RoadReady Pass RR-0829-41 · ${centre} · Ready for one visit`
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
                <ScanLine size={18} aria-hidden="true" />
                {t('Run document pre-check', 'दस्तावेज़ पूर्व-जाँच चलाएँ')}
              </button>
            </div>
          </section>
        )}

        {stage === 'preflight' && (
          <section className="tool-card">
            <div className="preflight-topline">
              <div className={`readiness-score ${nameMismatchResolved ? 'ready' : ''}`}>
                <strong>{nameMismatchResolved ? '100' : '82'}</strong>
                <span>{t('Ready score', 'तैयारी स्कोर')}</span>
              </div>
              <div className="stage-heading">
                <span className="stage-icon">
                  <FileSearch size={24} aria-hidden="true" />
                </span>
                <div>
                  <p className="overline">{t('Synthetic document preflight', 'काल्पनिक दस्तावेज़ पूर्व-जाँच')}</p>
                  <h2>
                    {nameMismatchResolved
                      ? t('Ready for one visit', 'एक यात्रा के लिए तैयार')
                      : t('Preflight found 1 issue', 'पूर्व-जाँच में 1 समस्या मिली')}
                  </h2>
                  <p>
                    {t(
                      'Resolve issues now instead of discovering them at the service counter.',
                      'सेवा काउंटर पर पता चलने के बजाय समस्याएँ अभी हल करें।',
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="preflight-checks">
              {[
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
              ].map((check) => (
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

            {!nameMismatchResolved ? (
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
            ) : (
              <div className="roadready-actions">
                <span className="ready-message">
                  <CheckCircle2 size={18} aria-hidden="true" />
                  {t('All four readiness checks passed', 'सभी चार तैयारी जाँच पास')}
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
                  <small>RR-0829-41</small>
                </div>
                <div className="pass-summary">
                  <span className="pass-score">100%</span>
                  <h2>{t('4 checks passed', '4 जाँच पास')}</h2>
                  <p>{t('3 services bundled · 1 visit planned', '3 सेवाएँ जोड़ी गईं · 1 यात्रा नियोजित')}</p>
                  <dl>
                    <div>
                      <dt>{t('Centre', 'केंद्र')}</dt>
                      <dd>{centre}</dd>
                    </div>
                    <div>
                      <dt>{t('Valid until', 'मान्य समय')}</dt>
                      <dd>30 Aug 2026 · 8:30 PM</dd>
                    </div>
                  </dl>
                </div>
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
                <button onClick={onManageAppointment}>
                  <MapPin size={19} aria-hidden="true" />
                  <span>
                    <strong>{t('Manage visit and map', 'यात्रा और नक्शा प्रबंधित करें')}</strong>
                    <small>{centre}</small>
                  </span>
                </button>
              </div>

              <div className="consent-audit">
                <div>
                  <ClipboardCheck size={17} aria-hidden="true" />
                  <span>
                    <strong>{t('Consent recorded', 'सहमति दर्ज')}</strong>
                    <small>29 Aug · 8:31 PM</small>
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
