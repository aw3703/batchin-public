# Roadmap

The public repository follows the hosted API contract. Items become complete only when the service exposes runtime evidence and the public clients can consume it.

## Current Focus

- Keep model discovery, pricing, usage, and provider errors evidence based.
- Expand async multimodal examples after each route has a verified task, billing, and output contract.
- Publish signed releases for each SDK and CLI package.

## Community Work

- Add issue labels and a regular triage cadence.
- Document compatibility matrices for supported SDK and runtime versions.
- Add integration examples only after they pass against a customer-safe test endpoint.

## Production Boundaries

- Provider credentials, customer data, internal routing policy, and settlement secrets stay in the private control plane.
- Fixtures and local tests never claim production model, payment, or chain availability.
