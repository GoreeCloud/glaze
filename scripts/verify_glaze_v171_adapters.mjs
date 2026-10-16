import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const fileNames=[
 'integrations/v1.7.1/asterport/preview.css',
 'integrations/v1.7.1/memos/preview.css',
 'integrations/v1.7.1/launcher/preview-dimens.xml'
];
const [ast,memos,launcher]=fileNames.map(get);
for(const css of [ast,memos]){
 assert.match(css,/\[data-glaze-v171-preview\]/);
 assert.match(css,/\.glaze-v171-preview-action:focus-visible/);
 assert.match(css,/forced-colors:active/);
 assert.match(css,/min-height:var\(--glaze-target-min\)/);
 for(const prohibited of ['@import','https://','url(http','!important',':root{'])
  assert.ok(!css.includes(prohibited),'unapproved integration side effect '+prohibited);
}
for(const role of ['--glaze-canvas','--glaze-surface','--glaze-text','--glaze-border','--glaze-focus']){
 assert.ok(ast.includes(role)&&memos.includes(role),'missing consumer role '+role);
}
for(const role of ['--ast-glaze-canvas','--ast-glaze-base','--ast-glaze-text-primary','--ast-glaze-focus'])
 assert.ok(ast.includes(role),'Asterport stable-owned mapping '+role);
for(const role of ['--background','--card','--foreground','--ring'])
 assert.ok(memos.includes(role),'Memos Tailwind role '+role);
for(const id of ['glaze_v171_preview_touch_min','glaze_v171_preview_home_columns','glaze_v171_preview_dock_columns','glaze_v171_preview_drawer_columns'])
 assert.ok(launcher.includes(id),'Launcher Android resource '+id);
assert.equal((launcher.match(/<integer[^>]+>5<\/integer>/g)||[]).length,3);
assert.match(launcher,/48dp/);
const life=JSON.parse(get('registry/lifecycle.json'));
assert.equal(life.currentStable,'1.7.0');
assert.equal(life.plannedNext,'1.7.1');
console.log('Glaze 1.7.1 consumer integration adapters: scoped preview contract PASS');
