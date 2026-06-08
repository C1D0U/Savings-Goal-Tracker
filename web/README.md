# Savings Goal Tracker Web

Next.js, TypeScript, Tailwind CSS, and Flowbite React frontend for the
Savings Goal Tracker MVP foundation.

## Environment

Copy `web/.env.example` to `web/.env.local` for local development.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SOROBAN_RPC` | Stellar Soroban RPC endpoint. Defaults to testnet. |
| `NEXT_PUBLIC_HORIZON_URL` | Horizon endpoint for balances/history. Defaults to testnet. |
| `NEXT_PUBLIC_USDC_ISSUER` | Testnet USDC issuer used for trustlines/payments. |
| `NEXT_PUBLIC_CONTRACT_ID` | Savings goal Soroban contract ID after deployment. |

No secrets or private keys are required in the frontend.

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run build
npm audit --audit-level=moderate
```

Open <http://localhost:3000> while the dev server is running.

## Soroban

The app works as a local savings goal planner without a contract ID. After the
Rust contract is deployed from the repo root, set `NEXT_PUBLIC_CONTRACT_ID` in
`web/.env.local` and restart the dev server to enable the on-chain goal panel.
