# Terqyn simplification — staged review

Production remains unchanged. This is a partial implementation with explicit release blockers.

## Changes staged

- HQ: Academy icon between Shop and About; Company footer links for Pics, Cortex, Employee Accounts, Sovereign and Vault; Today under Explore; moved destinations no longer rendered as planets; Beam, Signal and Vault have smaller spheres and full link targets; existing unrelated destinations, styling, animations, login rocket, account creation and AI scripts retained.
- HQ Shop: Beam collaboration and Vault free storage tool, with account requirement and existing 25 MB per-file limit. No unlimited storage claim.
- Systems: new More view inside the existing membership gate links to Beam, Vault and Signal. No authorization changes.
- Nexus: Forge icon beside Intelligences opens /forge/. The complete version 8 worker is ported with its pages, original artwork, design wizard, Launchpad, sandbox, source editing, exports and checkpoints. Existing API targets and caps remain. Original Forge is still operational and unchanged.

## Review previews

- HQ: https://terqyn-flagship-58kpyni4m-meridian88s-projects.vercel.app
- Systems: https://meridian-7930zoekd-meridian88s-projects.vercel.app
- Nexus and integrated Forge: https://terqyn-nexus-r7hpqx2lr-meridian88s-projects.vercel.app/forge/

All three builds reached READY. Vercel preview authentication remains enabled; review may require the owner's Vercel login. No production aliases were reassigned.

## Backup and rollback

HQ repository baseline: a9f22bee25f807c9347c24cb3fae11ff392d0842. Its root differs from the current live deployment. The exact live index and complete immutable deployed source references are captured in baseline-manifest.json, with restore instructions in RESTORE.md. Backup branch: backup/pre-simplification-2026-11-02-a9f22bee; baseline capture commit dc6526c016e5d167fbff02be6a8c3a1a7741f7e0.

Original deployments:

| Project | Production deployment | Restore rehearsal |
| --- | --- | --- |
| HQ | dpl_CbJihKCmqiBbTqVpsqU2Hehdvom4 | dpl_EhH8hT9VtCExx9fXjjpvP43VZikD — READY |
| Nexus | dpl_CSvYrHcSRHgmza84zk2TYrH46Gk7 | dpl_4UboLAo5Jvtewiao6V5yqaodGKhH — READY |
| Systems | dpl_5mZ8MFpaojgpM8eHJ7tco9PKpTvh | Source branch preserved at 296440bf071bbb75e2fd3531ad77d968f1910453 |
| Standalone Forge | appgdep_6ae7fd1e5e348191bc58b45e0745a7dd | Saved version 8; source 206758b20b241021fe8bcde120a69267b4a5d535; original unchanged |
| Vault | appgdep_6ae7a9ef33648191a88f86bed72281a7 | Saved version 6; source dfc6b974561f769cd7dcd1abd53d8f7533f575b3; original unchanged |

Systems source backup: Meridian88/meridian branch backup/pre-simplification-2026-11-02-296440bf. Forge and Vault source checkouts match their recorded saved commits. Forge's saved archive hash is sha256:2c6b35b27fa684f206455745cc880d1160c972e03c63d5c23cf2ab2b2281e1a5. Forge has no D1 or R2 binding; its projects and designs are browser-local. Remote service requests use an existing separate backend.

Rollback before promotion requires no action because production is unchanged. After any future approved promotion, restore the corresponding recorded production deployment. Never deploy the older repository-root HQ to restore the newer live source.

Backup gaps: database/upload snapshots and independent full HQ backend source export are not verified. Six HQ backend files are preserved by immutable hosting source references rather than independent offline bytes. The reference restore was rebuilt successfully, but depends on the hosting account. Runtime secrets were not exported or changed. No database, storage, identity, billing or permissions were modified.

## Verification

- HQ navigation regression assertions pass: destination retention, placement, secondary planets, Shop links, unchanged login/promotion pages, retained AI script references, page rendering.
- Desktop HQ visual check at 1363 px and a 390 px responsive frame (375 px content viewport): no horizontal overflow; Academy placement and mobile menu confirmed. Keyboard Enter opens/closes project tools.
- Systems existing complete build/validation pipeline passes, including membership, identity/RBAC, provider secrecy, operational pipeline and Forge runtime regression checks. These are build-time checks, not proof of authenticated production transactions.
- Original Forge: 27/27 tests pass. Nexus adapter: 5/5 tests pass for all pages/assets, base paths, manifest scope, portable export semantics, origin/method/body checks, fixed upstream targets, and backend preservation.
- Hosted integrated Forge runtime and studio return HTTP 200 with correct limits and prefixed assets.
- Local browser: original Forge landing and design studio render; source edited to an interactive counter and executed successfully; source and checkpoint survived reload; checkpoint restored the earlier source. Prototype isolation retained.
- Local browser AI smoke test returned a connection-unavailable message. A direct request to the unchanged HQ Forge preview endpoint returned HTTP 200 with a real AI response. This confirms the shared service is reachable from the executor, but does not verify the integrated browser-to-backend path in the isolated preview. Treat that path as an unresolved verification blocker.

## Incomplete requirements and release blockers

1. Existing-user project migration: old terqynforge.app browser storage is untouched and cannot automatically appear on a new origin. A migration notice provides access to the original. Export/import with an original user project and its history still needs a complete rehearsal before transfer can be called complete. No original entry point may be retired.
2. No full external database/upload backup or restore rehearsal is verified. Keep data-layer work blocked.
3. Authenticated account creation, employee/admin access, real checkout/payment, production uploads/downloads, AI and service-request submission need end-to-end verification. A page load or a mock does not satisfy these requirements.
4. Hosted browser inspection is gated by Vercel authentication. Local browser QA and authenticated HTTP fetches were used without disabling protection.

Review branches and draft PRs preserve the work without a production release. Do not promote or describe this as fully complete until the blockers above are resolved.
