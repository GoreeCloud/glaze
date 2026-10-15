import assert from 'node:assert/strict';
import {applyDensity} from '../js/glaze-v1.7.1-density.development.mjs';
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
assert.match(html,/data-density="compact"/);
assert.match(html,/data-density="comfortable"/);
assert.match(read('reference/v1.7.1/visual-evolution.html'),/wireDensity\(root,document\)/);
const densityCSS=read('css/glaze-v1.7.1-density.development.css');
assert.match(densityCSS,/data-glaze-density="compact"/);
assert.match(densityCSS,/min-height:44px/);
const fakeRoot={dataset:{}};
const fakeButton={dataset:{density:'compact'},attributes:{},setAttribute(key,value){this.attributes[key]=value;}};
assert.equal(applyDensity(fakeRoot,'unknown',[fakeButton]),false,'invalid mode must fail');
assert.equal(fakeRoot.dataset.glazeDensity,undefined);
assert.equal(applyDensity(fakeRoot,'compact',[fakeButton]),true);
assert.equal(fakeRoot.dataset.glazeDensity,'compact');
assert.equal(fakeButton.attributes['aria-pressed'],'true');

assert.match(html,/role="tabpanel"/);
assert.match(html,/data-colorize/);
assert.match(html,/id="memo-customize-dialog"/);
assert.match(html,/id="glaze-notice-preview"/);
assert.match(html,/aria-live="polite"/);
const noticeSource=read('js/glaze-v1.7.1-notice-demo.development.mjs');
const noticeCss=read('css/glaze-v1.7.1-notice-demo.development.css');
for(const tone of ['security','warning','privacy']) {
 assert.ok(html.includes('data-notice-demo="'+tone+'"'));
 assert.ok(noticeSource.includes(tone));
 assert.ok(noticeCss.includes('data-tone='+tone));
}
for(const restricted of ['localStorage','sessionStorage','sendBeacon','XMLHttpRequest']) assert.ok(!noticeSource.includes(restricted));
assert.match(noticeCss,/forced-colors:active/);

assert.match(html,/id="memo-label-input"/);
assert.match(html,/data-memo-tone="green"/);
assert.match(html,/glaze-v1.7.1-memo-customizer.development.mjs/);
const customizer=read('js/glaze-v1.7.1-memo-customizer.development.mjs');
const editorCSS=read('css/glaze-v1.7.1-memo-customizer.development.css');
assert.match(customizer,/memoDialog.showModal\(\)/);
assert.match(customizer,/memoDialog.close\('cancel'\)/);
assert.match(customizer,/opener\.focus\(\)/);
assert.match(customizer,/textContent = label/);
assert.match(editorCSS,/forced-colors:active/);
assert.match(editorCSS,/prefers-reduced-motion:reduce/);
for(const restricted of ['localStorage','sessionStorage','sendBeacon','XMLHttpRequest']) assert.ok(!customizer.includes(restricted));

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
