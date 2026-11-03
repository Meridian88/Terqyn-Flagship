# Terqyn simplification — completed live release

The requested navigation changes and full Forge experience are now live. The original standalone Forge remains available.

## Live results

| Destination | Completed change | Production deployment |
| --- | --- | --- |
| https://terqyn.com | Academy in header; Pics, Cortex, Employee Accounts, Sovereign and Vault in Company; Today in Explore; smaller Beam, Signal and Vault planets; Beam and free Vault tool in Shop | dpl_5L35aJ6Wzzop3TQUN7YKHVBpa8q2 |
| https://terqynsystems.com | Protected member More view with Beam, Vault and Signal | dpl_5qStFWZxFTzXkC5qxWzKcfCUDmmy |
| https://terqyn.nexus | Forge icon beside Intelligences; full application at /forge/ | dpl_5SXetPfTCAMzSmnxEoK7PwjKPoTE |
| https://terqynforge.app | Original experience retained; added optional saved-project transfer | appgdep_6ae9347d6710819180297fb3e38a6c7f |

No unrelated redesign, new pricing, authentication change, permission change or payment infrastructure was introduced. Vault keeps its account requirement and 25 MB per-file limit; no unlimited storage promise was added. Academy, Vault's storage backend, Sovereign, Cortex, and account services were not modified.

## Forge data preservation

All original landing/studio/workspace/Launchpad/about/embed/sandbox pages, avatar assets, source tools, exports, checkpoints, fixed AI/intake services and existing limits are retained. The integrated experience uses its own /forge paths and service-worker scope.

Saved browser data cannot silently move between domains. The “Bring my existing projects” option at https://terqyn.nexus/forge/import/ copies saved designs, project files and checkpoints from the same browser's original Forge. It verifies sender origin, popup source and a one-time nonce. Destination data is backed up before changes; conflicts, quota failures or existing item limits abort without discarding work. Original Forge data is never deleted or overwritten.

A live cross-origin rehearsal copied two test projects and their checkpoint into production Nexus. The imported project and checkpoint were visible, and the originals remained available. This verifies the transfer mechanism; it does not claim every customer's device has already run the copy.

## Verification

- HQ navigation regression assertions passed, including preservation of underlying destinations, login/promotion pages and AI script references.
- Desktop and narrow mobile layouts rendered without horizontal overflow; keyboard operation of the Shop menu was checked.
- Systems production build and existing membership, identity/RBAC, pipeline, data, secrecy and runtime checks passed.
- Forge: 31 tests passed, including four transfer/recovery tests. Nexus adapter: five tests passed.
- Browser workflow: source editing, interactive execution, source persistence after reload, checkpoint creation and restoration passed.
- Actual hosted preview and live Nexus AI conversations returned real responses.
- Live custom-domain aliases were verified against the new production deployment IDs.
- No real-money checkout, live customer service-request submission or production customer-file alteration was performed. Those existing services and their rules were not changed.

## Backups and rollback

| Project | Original source / saved version | Previous production deployment |
| --- | --- | --- |
| HQ | repository a9f22bee25f807c9347c24cb3fae11ff392d0842 plus exact live baseline capture dc6526c016e5d167fbff02be6a8c3a1a7741f7e0 | dpl_CbJihKCmqiBbTqVpsqU2Hehdvom4 |
| Nexus | exact source references and public index in baseline-manifest.json | dpl_CSvYrHcSRHgmza84zk2TYrH46Gk7 |
| Systems | 296440bf071bbb75e2fd3531ad77d968f1910453, backup/pre-simplification-2026-11-02-296440bf | dpl_5mZ8MFpaojgpM8eHJ7tco9PKpTvh |
| Original Forge | saved version 8; 206758b20b241021fe8bcde120a69267b4a5d535 | appgdep_6ae7fd1e5e348191bc58b45e0745a7dd |

HQ backup branch: backup/pre-simplification-2026-11-02-a9f22bee. Original HQ and Nexus source-reference restore deployments rebuilt to READY. Their IDs and instructions remain in baseline-manifest.json / RESTORE.md. Restore the relevant previous production deployment to reverse the corresponding release. Do not deploy the older HQ repository root as a substitute for the captured live baseline.

Forge transfer source is 024390ff8364c3edb4aef24298de1ba03269934b, saved version 9. Its source archive is sha256:3b119e34f2d5439dfb21ce6aeab809a99e4641d37f5a1a840eb2869e0ae16b4c. The complete Nexus integration source is preserved privately in Meridian88/meridian under integrations/nexus-forge on renovation/nexus-forge-integration-2026-11-02.

Backup scope: source, deployed versions and rollback references are retained. No company-wide database/upload export was made. This release does not migrate or modify those stores; they remain on their original services. Six HQ backend files are retained through immutable hosting source references rather than independent offline copies. The successful source-reference restore depends on the hosting account. Runtime secrets were not exported or changed.
