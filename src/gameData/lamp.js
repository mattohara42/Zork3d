// Verbatim LAMP-TABLE from 1actions.zil - the battery lamp's dimming
// warnings, keyed on cumulative turns spent lit. GO's `<QUEUE I-LANTERN
// 200>` plus the table's own successive intervals (100, then +70=170,
// then +15=185) work out to: dim at 100 turns lit, dimmer at 170, nearly
// out at 185, burned out for good at 186. Simplified: the source's timer
// runs off the interrupt queue and can drift slightly from turn parity
// with other clocked events (candles, the thief demon); here it's just a
// plain counter incremented once per player action while the lamp is on,
// which is the same effective behavior for a single light source.
export const LAMP_DIM_1 = 100;
export const LAMP_DIM_2 = 170;
export const LAMP_NEARLY_OUT = 185;
export const LAMP_BURNOUT = 186;

export const LAMP_DIM_1_TEXT = 'The lamp appears a bit dimmer.';
export const LAMP_DIM_2_TEXT = 'The lamp is definitely dimmer now.';
export const LAMP_NEARLY_OUT_TEXT = 'The lamp is nearly out.';
export const LAMP_BURNOUT_TEXT = "You'd better have more light than from the brass lantern.";
