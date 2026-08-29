import {
  ArrowRight,
  BadgeCheck,
  BusFront,
  CalendarDays,
  CarFront,
  CircleGauge,
  FileCheck2,
  Gauge,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react'

type Translate = (english: string, hindi: string) => string

type TransportServiceHubProps = {
  t: Translate
  onRoadReady: () => void
  onNewLicence: () => void
  onRenew: () => void
  onTrack: () => void
  onAppointment: () => void
  onChallan: () => void
  onRto: () => void
  onDocuments: () => void
}

export function TransportServiceHub({
  t,
  onRoadReady,
  onNewLicence,
  onRenew,
  onTrack,
  onAppointment,
  onChallan,
  onRto,
  onDocuments,
}: TransportServiceHubProps) {
  return (
    <section className="transport-hub" aria-labelledby="mobility-heading">
      <div className="container">
        <div className="transport-hub-heading">
          <div>
            <p className="overline">
              {t('Citizen transport dashboard', 'नागरिक परिवहन डैशबोर्ड')}
            </p>
            <h2 id="mobility-heading">
              {t('Your mobility at a glance', 'आपकी परिवहन स्थिति एक नज़र में')}
            </h2>
          </div>
          <button className="button primary" onClick={onRoadReady}>
            <Sparkles size={17} aria-hidden="true" />
            {t('Create One-Visit Pass', 'एक-यात्रा पास बनाएँ')}
          </button>
        </div>

        <div className="mobility-status-grid">
          <button onClick={onRenew}>
            <span className="status-card-icon blue">
              <BadgeCheck size={21} aria-hidden="true" />
            </span>
            <span>
              <small>{t('Driving licence', 'ड्राइविंग लाइसेंस')}</small>
              <strong>{t('Expires in 17 days', '17 दिनों में समाप्त')}</strong>
              <em>{t('Renew now', 'अभी नवीनीकरण करें')}</em>
            </span>
          </button>
          <button onClick={onChallan}>
            <span className="status-card-icon amber">
              <ReceiptText size={21} aria-hidden="true" />
            </span>
            <span>
              <small>eChallan</small>
              <strong>{t('1 pending · ₹1,000', '1 लंबित · ₹1,000')}</strong>
              <em>{t('Review and pay', 'देखें और भुगतान करें')}</em>
            </span>
          </button>
          <button onClick={onDocuments}>
            <span className="status-card-icon green">
              <ShieldCheck size={21} aria-hidden="true" />
            </span>
            <span>
              <small>{t('Vehicle insurance', 'वाहन बीमा')}</small>
              <strong>{t('Active until Feb 2027', 'फरवरी 2027 तक सक्रिय')}</strong>
              <em>{t('Document available', 'दस्तावेज़ उपलब्ध')}</em>
            </span>
          </button>
          <button onClick={onRoadReady}>
            <span className="status-card-icon orange">
              <CircleGauge size={21} aria-hidden="true" />
            </span>
            <span>
              <small>{t('PUC certificate', 'PUC प्रमाणपत्र')}</small>
              <strong>{t('Due in 21 days', '21 दिनों में देय')}</strong>
              <em>{t('Add to RoadReady', 'RoadReady में जोड़ें')}</em>
            </span>
          </button>
        </div>

        <div className="transport-service-groups">
          <article>
            <div className="group-heading">
              <span>
                <BadgeCheck size={22} aria-hidden="true" />
              </span>
              <div>
                <h3>{t('Licence services', 'लाइसेंस सेवाएँ')}</h3>
                <p>{t('Learn, apply, renew and track', 'सीखें, आवेदन, नवीनीकरण और ट्रैक')}</p>
              </div>
            </div>
            <div className="group-links">
              <button
                onClick={onNewLicence}
                aria-label={t(
                  'Apply for a new driving licence',
                  'नए ड्राइविंग लाइसेंस के लिए आवेदन करें',
                )}
              >
                {t('New driving licence', 'नया ड्राइविंग लाइसेंस')}
                <ArrowRight size={15} />
              </button>
              <button onClick={onRenew}>
                {t('Renew licence', 'लाइसेंस नवीनीकरण')}
                <ArrowRight size={15} />
              </button>
              <button onClick={onTrack}>
                {t('Track application', 'आवेदन ट्रैक करें')}
                <ArrowRight size={15} />
              </button>
            </div>
          </article>

          <article>
            <div className="group-heading">
              <span>
                <CarFront size={22} aria-hidden="true" />
              </span>
              <div>
                <h3>{t('Vehicle services', 'वाहन सेवाएँ')}</h3>
                <p>{t('Registration, transfer and records', 'पंजीकरण, हस्तांतरण और रिकॉर्ड')}</p>
              </div>
            </div>
            <div className="group-links">
              <button onClick={onRoadReady}>
                {t('RC address update', 'RC पता अपडेट')}
                <ArrowRight size={15} />
              </button>
              <button onClick={onDocuments}>
                {t('Vehicle documents', 'वाहन दस्तावेज़')}
                <ArrowRight size={15} />
              </button>
              <button onClick={onRoadReady}>
                {t('Transfer & NOC planner', 'हस्तांतरण और NOC योजना')}
                <ArrowRight size={15} />
              </button>
            </div>
          </article>

          <article>
            <div className="group-heading">
              <span>
                <Wrench size={22} aria-hidden="true" />
              </span>
              <div>
                <h3>{t('PUC & fitness', 'PUC & fitness')}</h3>
                <p>{t('Compliance and roadworthiness', 'अनुपालन और सड़क योग्यता')}</p>
              </div>
            </div>
            <div className="group-links">
              <button onClick={onRoadReady}>
                {t('PUC readiness check', 'PUC तैयारी जाँच')}
                <ArrowRight size={15} />
              </button>
              <button onClick={onRto}>
                {t('Find inspection centre', 'निरीक्षण केंद्र खोजें')}
                <ArrowRight size={15} />
              </button>
              <button onClick={onDocuments}>
                {t('Fitness record', 'फिटनेस रिकॉर्ड')}
                <ArrowRight size={15} />
              </button>
            </div>
          </article>

          <article>
            <div className="group-heading">
              <span>
                <BusFront size={22} aria-hidden="true" />
              </span>
              <div>
                <h3>{t('Permit & tax', 'Permit & tax')}</h3>
                <p>{t('Commercial and interstate travel', 'वाणिज्यिक और अंतरराज्यीय यात्रा')}</p>
              </div>
            </div>
            <div className="group-links">
              <button onClick={onRoadReady}>
                {t('Permit requirement guide', 'परमिट आवश्यकता मार्गदर्शिका')}
                <ArrowRight size={15} />
              </button>
              <button onClick={onRto}>
                {t('Find permit office', 'परमिट कार्यालय खोजें')}
                <ArrowRight size={15} />
              </button>
              <button onClick={onDocuments}>
                {t('Tax receipt records', 'कर रसीद रिकॉर्ड')}
                <ArrowRight size={15} />
              </button>
            </div>
          </article>
        </div>

        <div className="transport-quick-actions">
          <button onClick={onChallan}>
            <ReceiptText size={18} />
            <span>
              <strong>{t('Check eChallan', 'ई-चालान जाँचें')}</strong>
              <small>{t('Violation and payment', 'उल्लंघन और भुगतान')}</small>
            </span>
          </button>
          <button
            onClick={onAppointment}
            aria-label={t('Manage appointment', 'अपॉइंटमेंट प्रबंधित करें')}
          >
            <CalendarDays size={18} />
            <span>
              <strong>{t('Manage appointment', 'अपॉइंटमेंट प्रबंधित करें')}</strong>
              <small>{t('Reschedule and map', 'समय बदलें और नक्शा')}</small>
            </span>
          </button>
          <button onClick={onRto} aria-label={t('Find an RTO', 'RTO खोजें')}>
            <MapPin size={18} />
            <span>
              <strong>{t('Find RTO', 'RTO खोजें')}</strong>
              <small>{t('Services and availability', 'सेवाएँ और उपलब्धता')}</small>
            </span>
          </button>
          <button
            onClick={onDocuments}
            aria-label={t('Get documents', 'दस्तावेज़ पाएँ')}
          >
            <FileCheck2 size={18} />
            <span>
              <strong>{t('Document wallet', 'दस्तावेज़ वॉलेट')}</strong>
              <small>{t('Receipts and passes', 'रसीदें और पास')}</small>
            </span>
          </button>
          <button onClick={onTrack}>
            <Gauge size={18} />
            <span>
              <strong>{t('Track status', 'स्थिति ट्रैक करें')}</strong>
              <small>{t('Next action explained', 'अगला कदम समझें')}</small>
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
