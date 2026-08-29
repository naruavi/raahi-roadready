import { ArrowRight, BadgeCheck, MapPin, ScanLine } from 'lucide-react'

type MobilityHeroSceneProps = {
  onOpenRoadReady: () => void
}

function CarIllustration({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 180 82"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M25 53 37 29c3-7 9-11 17-12h54c8 0 14 4 19 11l15 24 15 5v13H14V58l11-5Z"
        fill="currentColor"
      />
      <path
        d="m48 28-9 22h88l-14-22a12 12 0 0 0-10-5H60c-6 0-10 2-12 5Z"
        fill="#dcecf7"
      />
      <path d="M82 23h6v27h-6z" fill="currentColor" opacity=".75" />
      <rect x="20" y="54" width="128" height="11" rx="4" fill="#0e355d" />
      <circle cx="45" cy="66" r="12" fill="#162431" />
      <circle cx="45" cy="66" r="5" fill="#dce4ea" />
      <circle cx="126" cy="66" r="12" fill="#162431" />
      <circle cx="126" cy="66" r="5" fill="#dce4ea" />
      <rect x="135" y="51" width="14" height="5" rx="2" fill="#f5b74b" />
      <rect x="20" y="51" width="10" height="5" rx="2" fill="#e95a4f" />
    </svg>
  )
}

export function MobilityHeroScene({
  onOpenRoadReady,
}: MobilityHeroSceneProps) {
  return (
    <button
      className="mobility-scene"
      onClick={onOpenRoadReady}
      aria-label="Open RoadReady animated one-visit journey"
    >
      <span className="scene-sky" aria-hidden="true">
        <span className="scene-sun" />
        <span className="scene-cloud cloud-one" />
        <span className="scene-cloud cloud-two" />
      </span>

      <span className="rto-building" aria-hidden="true">
        <span className="rto-flag">
          <i />
          <i />
          <i />
        </span>
        <span className="rto-sign">CITIZEN MOBILITY CENTRE</span>
        <span className="rto-windows">
          <i />
          <i />
          <i />
        </span>
        <span className="rto-door" />
      </span>

      <span className="digital-licence-card" aria-hidden="true">
        <span className="licence-topline">
          <b>IND</b>
          <small>DIGITAL DRIVING LICENCE</small>
        </span>
        <span className="licence-content">
          <span className="licence-photo">AM</span>
          <span className="licence-lines">
            <i />
            <i />
            <i />
          </span>
        </span>
        <span className="licence-footer">
          <b>DL-0420110149646</b>
          <span className="licence-qr" />
        </span>
      </span>

      <span className="scan-gate" aria-hidden="true">
        <ScanLine size={19} />
        <i />
      </span>

      <span className="roadready-mini-pass" aria-hidden="true">
        <BadgeCheck size={17} />
        <span>
          <small>ROADREADY</small>
          <b>ONE-VISIT PASS</b>
        </span>
        <i>100%</i>
      </span>

      <span className="scene-road" aria-hidden="true">
        <i className="lane-mark lane-one" />
        <i className="lane-mark lane-two" />
        <i className="lane-mark lane-three" />
        <CarIllustration className="scene-car main-car" />
        <CarIllustration className="scene-car second-car" />
      </span>

      <span className="journey-checkpoint checkpoint-one" aria-hidden="true">
        <BadgeCheck size={14} />
        Documents
      </span>
      <span className="journey-checkpoint checkpoint-two" aria-hidden="true">
        <MapPin size={14} />
        One visit
      </span>

      <span className="scene-caption">
        <span>
          <small>ROADREADY IN MOTION</small>
          <strong>From scattered services to one successful visit.</strong>
        </span>
        <ArrowRight size={19} aria-hidden="true" />
      </span>
    </button>
  )
}
