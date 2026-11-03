Pre-simplification baseline

This captures the exact public HQ and Nexus index files and every deployed source SHA reference. The repository root is older than the current HQ deployment and must NOT be deployed to restore the current experience.

Rollback: keep production aliases unchanged during previews. If a later release needs reversal, restore the recorded original production deployment through Vercel for that project. No database rollback is needed for these navigation-only patches.

Restore rehearsal: create a preview on the same project using the manifest's files array; omit target (Vercel API default is preview), preserve project configuration. Both HQ and Nexus original source arrays rebuilt to READY. Do not promote the rehearsal preview: preview runtime configuration may differ from production.

Limitations: database/upload snapshots and a full independent offline backend export have not been verified. Source references depend on the hosting account. Do not change databases, storage, authentication, billing or Forge project data under this backup coverage.
