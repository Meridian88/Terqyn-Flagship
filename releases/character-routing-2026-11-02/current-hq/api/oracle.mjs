import handler from '../lib/oracle-handler.mjs';
import { nexusOrigin } from '../lib/nexus-origin.mjs';
import { reservedIntelligences } from '../lib/agent-slots.mjs';
import { characterRouting } from '../lib/character-routing.mjs';
export default nexusOrigin(characterRouting(reservedIntelligences(handler)));
