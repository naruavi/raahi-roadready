import { type FormEvent, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileWarning,
  Info,
  MapPin,
  Search,
  ShieldCheck,
  WalletCards,
} from 'lucide-react'

type Translate = (english: string, hindi: string) => string

type ChallanViewProps = {
  t: Translate
  onBack: () => void
  onDownloadReceipt: () => void
}

export function ChallanView({
  t,
  onBack,
  onDownloadReceipt,
}: ChallanViewProps) {
  const [vehicleNumber, setVehicleNumber] = useState('DL 3C AB 8421')
  const [chassisDigits, setChassisDigits] = useState('4821')
  const [searched, setSearched] = useState(false)
  const [paid, setPaid] = useState(
    () => localStorage.getItem('raahi-challan-paid') === 'true',
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const searchChallans = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      vehicleNumber.replace(/\s/g, '').length < 8 ||
      chassisDigits.replace(/\D/g, '').length !== 4
    ) {
      setError(
        t(
          'Enter the fictional vehicle number and four chassis digits shown.',
          'दिखाया गया काल्पनिक वाहन नंबर और चेसिस के चार अंक दर्ज करें।',
        ),
      )
      return
    }
    setError('')
    setLoading(true)
    window.setTimeout(() => {
      setSearched(true)
      setLoading(false)
    }, 350)
  }

  const payChallan = () => {
    setLoading(true)
    window.setTimeout(() => {
      localStorage.setItem('raahi-challan-paid', 'true')
      setPaid(true)
      setLoading(false)
    }, 500)
  }

  return (
    <main id="main-content" className="inner-page service-tool-page">
      <div className="container narrow-container">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={18} aria-hidden="true" />
          {t('Back to services', 'सेवाओं पर वापस जाएँ')}
        </button>

        <div className="page-heading">
          <p className="overline">{t('Traffic services', 'यातायात सेवाएँ')}</p>
          <h1>{t('Check an eChallan', 'ई-चालान जाँचें')}</h1>
          <p>
            {t(
              'Find pending traffic challans, understand the violation and complete a simulated payment.',
              'लंबित ट्रैफ़िक चालान खोजें, उल्लंघन समझें और डेमो भुगतान पूरा करें।',
            )}
          </p>
        </div>

        <section className="tool-card">
          <form className="tool-search-form" onSubmit={searchChallans}>
            <div className="tool-search-grid">
              <label className="field">
                <span>{t('Vehicle number', 'वाहन नंबर')}</span>
                <input
                  value={vehicleNumber}
                  onChange={(event) => {
                    setVehicleNumber(event.target.value.toUpperCase())
                    setSearched(false)
                    setError('')
                  }}
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
              <label className="field">
                <span>
                  {t('Last 4 chassis digits', 'चेसिस के अंतिम 4 अंक')}
                </span>
                <input
                  value={chassisDigits}
                  onChange={(event) => {
                    setChassisDigits(
                      event.target.value.replace(/\D/g, '').slice(0, 4),
                    )
                    setSearched(false)
                    setError('')
                  }}
                  inputMode="numeric"
                  autoComplete="off"
                />
              </label>
            </div>
            <div className="tool-form-footer">
              <p>
                <ShieldCheck size={16} aria-hidden="true" />
                {t(
                  'Pre-filled fictional vehicle details',
                  'पहले से भरे काल्पनिक वाहन विवरण',
                )}
              </p>
              <button className="button primary" type="submit" disabled={loading}>
                <Search size={18} aria-hidden="true" />
                {loading
                  ? t('Searching…', 'खोज जारी है…')
                  : t('Search challans', 'चालान खोजें')}
              </button>
            </div>
          </form>

          {error && (
            <div className="error-message" role="alert">
              <Info size={18} aria-hidden="true" />
              {error}
            </div>
          )}

          {searched && !paid && (
            <div className="challan-result">
              <div className="result-heading">
                <span className="result-icon warning">
                  <FileWarning size={23} aria-hidden="true" />
                </span>
                <div>
                  <p className="overline">{vehicleNumber}</p>
                  <h2>{t('1 pending challan', '1 लंबित चालान')}</h2>
                </div>
                <span className="pending-pill">{t('Payment due', 'भुगतान बाकी')}</span>
              </div>

              <div className="challan-detail-grid">
                <div className="challan-main-detail">
                  <span className="detail-label">
                    {t('Violation', 'उल्लंघन')}
                  </span>
                  <h3>{t('Red light violation', 'लाल बत्ती का उल्लंघन')}</h3>
                  <dl>
                    <div>
                      <dt>{t('Challan number', 'चालान नंबर')}</dt>
                      <dd>DL-TRF-2026-18429</dd>
                    </div>
                    <div>
                      <dt>{t('Date and time', 'तारीख और समय')}</dt>
                      <dd>24 Aug 2026 · 10:42 AM</dd>
                    </div>
                    <div>
                      <dt>{t('Location', 'स्थान')}</dt>
                      <dd>
                        <MapPin size={14} aria-hidden="true" />
                        Dwarka Sector 6 crossing
                      </dd>
                    </div>
                  </dl>
                </div>
                <aside className="challan-amount">
                  <span>{t('Amount due', 'देय राशि')}</span>
                  <strong>₹1,000</strong>
                  <small>{t('Due by 7 Sep 2026', '7 सितंबर 2026 तक')}</small>
                </aside>
              </div>

              <div className="action-notice">
                <AlertTriangle size={18} aria-hidden="true" />
                <p>
                  {t(
                    'Review the fictional violation before paying. A real service should also provide evidence and a dispute route.',
                    'भुगतान से पहले काल्पनिक उल्लंघन की समीक्षा करें। वास्तविक सेवा में प्रमाण और आपत्ति का विकल्प भी होना चाहिए।',
                  )}
                </p>
              </div>

              <div className="challan-actions">
                <button
                  className="button primary"
                  onClick={payChallan}
                  disabled={loading}
                >
                  <WalletCards size={18} aria-hidden="true" />
                  {loading
                    ? t('Processing…', 'प्रक्रिया जारी है…')
                    : t('Pay ₹1,000 (demo)', '₹1,000 डेमो भुगतान करें')}
                </button>
                <button className="button secondary" type="button">
                  {t('Report an issue', 'समस्या बताएँ')}
                </button>
              </div>
            </div>
          )}

          {searched && paid && (
            <div className="payment-success">
              <span className="success-mark compact">
                <CheckCircle2 size={29} aria-hidden="true" />
              </span>
              <p className="overline">{t('Payment reference RAH-82941', 'भुगतान संदर्भ RAH-82941')}</p>
              <h2>{t('Demo payment complete', 'डेमो भुगतान पूरा हुआ')}</h2>
              <p>
                {t(
                  'The fictional challan is marked as paid. No bank, UPI or government service was contacted.',
                  'काल्पनिक चालान भुगतान के रूप में दर्ज है। किसी बैंक, UPI या सरकारी सेवा से संपर्क नहीं हुआ।',
                )}
              </p>
              <button
                className="button secondary"
                onClick={onDownloadReceipt}
              >
                <Download size={18} aria-hidden="true" />
                {t('Download challan receipt', 'चालान रसीद डाउनलोड करें')}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
