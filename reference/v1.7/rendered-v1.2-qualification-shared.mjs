export const escapeHtml=value=>String(value??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const card=(title,value)=>'<div class="card"><h3>'+escapeHtml(title)+'</h3><div class="value">'+escapeHtml(value)+'</div></div>';
export const showCards=(stage,title,items,composition='single-pane')=>{
  stage.dataset.composition=composition;
  stage.innerHTML='<section class="panel"><h2>'+escapeHtml(title)+'</h2><div class="grid">'+items.join('')+'</div></section>';
};
export const taskState=Object.freeze({
  navigationDestination:'memos/detail',
  focusId:'memo-title',
  selectionIds:Object.freeze(['memo-42']),
  draftText:'A preserved draft',
  activeFilters:Object.freeze(['work']),
  query:'continuity',
  paneState:'detail',
  workingContext:Object.freeze({provider:'authoritative'})
});
export const taskStateClasses=Object.freeze({
  navigationDestination:'durable',
  focusId:'session-scoped',
  selectionIds:'session-scoped',
  draftText:'recoverable',
  activeFilters:'durable',
  query:'session-scoped',
  paneState:'presentation-only',
  workingContext:'provider-owned'
});
