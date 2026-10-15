import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('reference/v1.7.1/visual-evolution-scenes.html');
const script=read('js/glaze-v1.7.1-scenes.development.mjs');
const css=read('css/glaze-v1.7.1-scenes.development.css');
const launcher=read('css/glaze-v1.7.1-scenes-launcher.development.css');
const glyphs=read('assets/icon-glyphs/system-symbols.svg');
const lifecycle=JSON.parse(read('registry/lifecycle.json'));
assert.equal(lifecycle.currentStable,'1.7.0');
assert.equal(lifecycle.plannedNext,'1.7.1');
for(const id of ['memos','launcher','dashboard']){
 assert.match(html,new RegExp('id="tab-'+id+'"'));
 assert.match(html,new RegExp('id="scene-'+id+'"'));
}
assert.match(html,/aria-live="polite"/);
assert.match(html,/role="tablist"/);
assert.match(html,/role="tabpanel"/);
assert.match(html,/data-colorize/);
assert.match(html,/id="sample-dialog"/);
assert.match(html,/id="scene-drawer"/);
assert.match(script,/showModal\(\)/);
assert.match(script,/ArrowRight/);
assert.match(script,/aria-expanded/);
assert.match(launcher,/grid-template-columns:repeat\(5,/);
for(const icon of [...html.matchAll(/system-symbols\.svg#([a-z-]+)/g)].map(m=>m[1])){
 assert.ok(glyphs.includes('<symbol id="'+icon+'"'),'Unresolved '+icon);
}
for(const forbidden of ['localStorage','sessionStorage','sendBeacon','XMLHttpRequest']){
 assert.ok(!script.includes(forbidden),'Forbidden demo behavior '+forbidden);
}
assert.match(css,/forced-colors:active/);
assert.match(css,/max-width:720px/);
assert.match(css,/scene-theme-bar/);
assert.match(css,/scene-theme-link/);
assert.match(css,/data-meaning="warning"/);
assert.match(css,/max-width:520px/);
assert.match(read('css/glaze-v1.7.1-scenes-memos.development.css'),/columns:2/);
for(const tone of ['information','warning']) assert.ok(html.includes('data-meaning="'+tone+'"'));
for(const theme of ['porcelain','cedar','nocturne','contrast']) assert.ok(html.includes('data-scene-theme="'+theme+'"'));

assert.ok(!read('js/glaze-v1.7.0.mjs').includes('scenes.development'));
console.log('Glaze scenes: source contract PASS; real human/native/AT qualification remains open.');
