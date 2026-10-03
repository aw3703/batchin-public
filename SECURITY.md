# Security Policy

## Supported Versions

Security fixes and cryptographic updates are maintained on `main` and the latest tagged release:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability or cryptographic flaw within BatchIn SDKs, MCP servers, smart contracts, or infrastructure:

1. **Do NOT open a public GitHub issue**.
2. Send a detailed report to **`security@batchin.tech`**.
3. Include:
   - Affected package or component and version
   - Proof of Concept (PoC) or reproduction steps
   - Potential impact (e.g., cryptographic bypass, replay attack, data leakage)
   - Affected deployment or API route, if the issue depends on the hosted service

Please redact API keys, provider credentials, payment secrets, private prompts, and personal data from reports and logs. A request ID or trace ID is useful for hosted-service reports.

## Responsible Disclosure

We commit to:
- Acknowledging receipt within two business days.
- Providing a preliminary assessment and remediation timeline as soon as the impact is confirmed.
- Coordinated disclosure once fixes and mitigation patches have been released.
