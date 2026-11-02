import { AsyncLocalStorage } from 'node:async_hooks';
const requests = new AsyncLocalStorage();
const upstream = globalThis.fetch.bind(globalThis);
globalThis.fetch = async (input, init) => {
  const response = await upstream(input, init);
  const state = requests.getStore();
  const url = typeof input === 'string' ? input : input?.url || String(input);
  if (state && url === 'https://skuwewlgtddqtcnpwhas.supabase.co/rest/v1/rpc/reserve_terqyn_public_chat' && response.ok) {
    try { const result = await response.clone().json(); if (result?.allowed === false) state.reason = result.reason; } catch {}
  }
  return response;
};
export function quotaFeedback(reason, now = new Date()) {
  const tomorrow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  const nextMonth = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1);
  const seconds = until => Math.max(1, Math.ceil((until - now.getTime()) / 1000));
  if (reason === 'visitor_minute') return { code: 'chat_rate_limit', retryAfter: 60, error: 'You have sent eight messages in one minute. Please wait a minute and try again. Your message is saved; this does not mean the guide is disconnected.' };
  if (reason === 'visitor_day' || reason === 'visitor') return { code: 'chat_visitor_daily_limit', retryAfter: seconds(tomorrow), error: 'This visitor’s daily complimentary chat allowance is used across HQ, Nexus and the guides. It resets at midnight UTC. Your message is saved; this does not mean the guide is disconnected.' };
  if (reason === 'global_day') return { code: 'chat_daily_allowance', retryAfter: seconds(tomorrow), error: 'Terqyn’s daily complimentary chat allowance is used. It resets at midnight UTC. Your message is saved. Contact support@terqyn.com for project help.' };
  if (reason === 'global_month') return { code: 'chat_monthly_allowance', retryAfter: seconds(nextMonth), error: 'Terqyn’s monthly complimentary chat allowance is used. Your message is saved. Contact support@terqyn.com for project help.' };
  return null;
}
export function withQuotaFeedback(handler) {
  return async (req, res) => {
    const original = res.json;
    const state = {};
    res.json = function (payload) {
      const feedback = res.statusCode === 429 ? quotaFeedback(state.reason) : null;
      if (feedback) { this.setHeader('Retry-After', String(feedback.retryAfter)); payload = { ...payload, error: feedback.error, code: feedback.code, retryAfter: feedback.retryAfter }; }
      return original.call(this, payload);
    };
    try { return await requests.run(state, () => handler(req, res)); }
    finally { res.json = original; }
  };
}
