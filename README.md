# Raahi

Raahi is an independent Build What Moves India prototype that simplifies common driving-licence and road-service journeys. Its flagship RoadReady flow bundles related services, checks synthetic documents before travel, and creates a privacy-preserving QR One-Visit Pass.

## Phase 2 differentiator

**VisitTwin** rehearses the complete RTO journey before the citizen travels. It
shows the exact service counter where a linked application would fail, explains
the consequence, applies an approved correction across the combined journey,
and replays the route until every counter is clear.

The final two-minute Phase 2 video is
[`public/raahi-phase2-demo.mp4`](public/raahi-phase2-demo.mp4), with captions in
[`public/raahi-phase2-demo.vtt`](public/raahi-phase2-demo.vtt). The exact pitch
and shot plan are in [`PHASE2-PITCH.md`](PHASE2-PITCH.md).

## Demo access

- Username: `testuser`
- Password: `test123`
- Phone sign-in code: `123456`

Never enter real personal, identity, payment, or government-service information.

## Run locally

```bash
npm install
npm run dev
```

## Quality commands

```bash
npm test
npm run build
npm run lint
```

All government responses, documents, fees, payments, accounts, and integrations are simulated with fictional data. Raahi is not affiliated with or endorsed by any government body.
