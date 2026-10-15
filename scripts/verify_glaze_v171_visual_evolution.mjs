#!/usr/bin/env node
/* Development-only visual-evolution contract checks.
 * Structural + automated checks cannot qualify human/native visual acceptance.
 */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const manifest=JSON.parse(read('tokens/v1.7.1/visual-evolution.development.json'));
const css=read('css/glaze-v1.7.1-visual-evolution.development.css');
const html=read('reference/v1.7.1/visual-evolution.html');
const iconSymbols=read('assets/icon-glyphs/system-symbols.svg');
const stable=read('js/glaze-v1.7.0.mjs');

const assertMessage=(condition,message)=>assert.ok(condition,message);
const hex=/^#[0-9a-f]{6}$/i;
function brightness(value){
  assertMessage(hex.test(value),'Invalid RGB hex '+value);
  const c=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255)
    .map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  return c[0]*.2126+c[1]*.7152+c[2]*.0722;
}
function contrast(a,b){
  const x=brightness(a),y=brightness(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
assert.equal(manifest.lifecycle,'Development');
assert.equal(manifest.stableBaseline,'1.7.0');
assert.equal(manifest.consumerEligible,false);
assert.equal(manifest.paletteAuthority.includes('no universal'),true);
assert.equal(manifest.safety.colorOnlyStateCommunication,false);
assert.equal(manifest.safety.identityMayOverrideProtectedSemantics,false);
assert.equal(manifest.safety.criticalTruthFromPresentation,false);
assertMessage(!stable.includes('visual-evolution'),'Stable runtime must not import this Development gallery');

const required=['canvas','surface','surfaceRaised','sidebar','border','text','muted','faint','accent','onAccent','accentSubtle','focus','selected','success','warning','danger','information','privacy','security','restricted','offline','syncing'];
const names=Object.keys(manifest.themeSamples);
assert.deepEqual(names,['porcelain','cedar','nocturne','contrast']);
for (const name of names) {
  const theme=manifest.themeSamples[name];
  assert.ok(['light','dark','high-contrast'].includes(theme.appearance));
  for(const key of required){
    assertMessage(hex.test(theme[key]),name+' missing '+key);
    assertMessage(css.includes('--'+key),key+' missing from stylesheet');
  }
  const pairs=[['text','surface'],['muted','surface'],['text','sidebar'],['onAccent','accent'],['success','surface'],['warning','surface'],['danger','surface'],['information','surface'],['privacy','surface'],['security','surface'],['offline','surface']];
  for(const [fg,bg] of pairs){
    const value=contrast(theme[fg],theme[bg]);
    assertMessage(value>=4.5,name+' contrast '+fg+'/'+bg+' '+value.toFixed(2)+' below 4.5');
  }
  assertMessage(html.includes('data-theme="'+name+'"'),'Theme selector missing '+name);
}

for (const id of Array.from(html.matchAll(/system-symbols\.svg#([a-z-]+)/g),x=>x[1])){
  assertMessage(iconSymbols.includes('<symbol id="'+id+'"'),'Unregistered symbol '+id);
}
assertMessage(html.includes('../../assets/identity/official/facet/glaze-ui-mark.svg'),'Expected canonical identity reference');
assertMessage(css.includes('@media(prefers-reduced-motion:reduce)'),'Reduced Motion fallback missing');
assertMessage(css.includes('@media(forced-colors:active)'),'Forced Colors fallback missing');
assertMessage(css.includes('@media(max-width:730px)'),'Compact composition missing');
assertMessage(css.includes(':focus-visible'),'Focus-visible treatment missing');
assertMessage(html.includes('aria-live="polite"'),'State announcement missing');
assertMessage(html.includes('aria-pressed='),'Theme selection semantics missing');
assertMessage(html.includes('role="switch"'),'Switch semantics missing');
assertMessage(html.includes('aria-checked='),'Switch checked state semantics missing');
assertMessage(html.includes('aria-current="page"'),'Current navigation semantics missing');
assertMessage(!/\b(?:https?:)?\/\/(?!localhost)/i.test(html.replace('<!doctype html>','')),'External resources are prohibited in the gallery');
assertMessage(html.includes('Illustrative states only'),'Example-state label missing');
assertMessage(html.includes('Development preview'),'Development notice missing');

console.log('Visual Evolution Development: structural contract PASS');
console.log('4 theme examples × 11 foreground/background contrast checks ≥ 4.5');
console.log('Canonical symbol references, local assets, responsive/accessibility fallbacks and Stable separation verified.');
console.log('Human, screen-reader, native, visual rendering, performance and release acceptance: NOT VERIFIED.');
