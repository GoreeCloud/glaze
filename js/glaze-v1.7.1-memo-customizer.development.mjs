/* Glaze V1.7.1 Development-only memo appearance editor.
   Synthetic notes only: changes remain in the rendered page, no persistence. */
const memoDialog = document.getElementById('memo-customize-dialog');
const memoLabelInput = document.getElementById('memo-label-input');
const memoStatus = document.getElementById('scene-status');
const memoSwatches = Array.from(memoDialog.querySelectorAll('[data-memo-tone]'));
const memoApply = document.getElementById('memo-customize-apply');
const memoCancel = document.getElementById('memo-customize-cancel');
const validTones = new Set(['', 'warm', 'green', 'rose']);
let activeNote = null;
let opener = null;
let draftTone = '';

function selectTone(tone) {
  draftTone = validTones.has(tone) ? tone : '';
  for (const swatch of memoSwatches) {
    swatch.setAttribute('aria-pressed', String(swatch.dataset.memoTone === draftTone));
  }
}

for (const button of document.querySelectorAll('[data-colorize]')) {
  button.addEventListener('click', () => {
    activeNote = button.closest('.scene-memo');
    if (!activeNote) return;
    opener = button;
    const currentLabel = activeNote.querySelector('.scene-label');
    memoLabelInput.value = currentLabel?.textContent.trim() ?? '';
    selectTone(activeNote.dataset.tone || '');
    memoDialog.showModal();
    memoLabelInput.focus();
  });
}
for (const swatch of memoSwatches) {
  swatch.addEventListener('click', () => selectTone(swatch.dataset.memoTone || ''));
}
memoApply.addEventListener('click', () => {
  if (!activeNote) return;
  activeNote.dataset.tone = draftTone;
  const label = memoLabelInput.value.trim().slice(0, 24);
  activeNote.querySelector('.scene-label').textContent = label || 'Unlabeled';
  memoStatus.textContent = 'Example note appearance updated. Nothing was saved to an account.';
  memoDialog.close('apply');
});
memoCancel.addEventListener('click', () => memoDialog.close('cancel'));
memoDialog.addEventListener('close', () => {
  if (opener?.isConnected) opener.focus();
  activeNote = null;
  opener = null;
});
