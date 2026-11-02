# HQ release workflow

Production contains shared launcher assets and private API adapters that are not all present at repository root. Do not deploy the repository root directly. The canonical complete source inventory is releases/customer-team-organization-2026-11-02/source-manifest.json, under hq. It contains retained Vercel source hashes and complete UTF-8 overrides. Preserve every inventory entry when making a release; replace only reviewed files. Create deployments through the Vercel source-file API using this complete inventory. A root-only Git deployment removes shared assets.

Customer routes belong first on HQ. Team operations, shared knowledge and accounts are grouped through https://terqynsovereign.center/. Keep every planet in the complete atlas. Do not remove access enforcement or merge private data merely to simplify navigation.
