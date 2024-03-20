const buttonParentQuerySelector = 'form.mb-3 '
  + '> div.shadow.darkmode-light.position-relative.search-bar-input-group.container.px-1.m-0 '
  + '> div.row '
  + '> div.col-4.d-flex.justify-content-end';

const addDocumentContentButtonQuerySelector = buttonParentQuerySelector
  + ' > button > i.fe.fe-file-plus';

const queryInputQuerySelector = 'textarea.form-control.bg-white.darkmode-light.searchbox-textarea.search-bar-hide-scrollbar.fs-5.px-2.pt-2.pb-0.my-1.mx-0.row';

const buttonParent = document.querySelector(buttonParentQuerySelector);

let tooltip = null;

let fileContents = '';

/** @type {HTMLTextAreaElement} */
let queryInput = null;


updateInput();

/** @type {HTMLButtonElement} */
const addDocumentContentButton = document.createElement('button');
addDocumentContentButton.setAttribute('type', 'button');
addDocumentContentButton.classList.add('btn', 'rounded-1', 'btn-sm', 'p-1', 'mx-1', 'fs-5', 'lift');
addDocumentContentButton.onmouseover = () => {
  createTooltip();
};
addDocumentContentButton.onmouseleave = () => {
  deleteTooltip();
};
addDocumentContentButton.onclick = () => {
  getFile();
};


/** @type {HTMLElement} */
const feIcon = document.createElement('i');
feIcon.classList.add('fe', 'fe-file-plus', 'masthead-textbox');

addDocumentContentButton.appendChild(feIcon);

const secondFromEnd = buttonParent.children[buttonParent.children.length - 2];
buttonParent.insertBefore(addDocumentContentButton, secondFromEnd);

function createTooltip() {
  if (tooltip) return;

  const addDocumentContentButton = document.querySelector(addDocumentContentButtonQuerySelector);
  if (!addDocumentContentButton) return;

  const boundaries = getOffset(addDocumentContentButton);
  const x = boundaries.left,
    y = boundaries.top;

  const t = fromHTML(`<div role="tooltip" x-placement="top" class="fade show tooltip bs-tooltip-top" id="button-tooltip" style="position: absolute; inset: auto auto 0px 0px; transform: translate3d(${x - 103}px, -${y + 100}px, 0px);" data-popper-reference-hidden="false" data-popper-escaped="false" data-popper-placement="top"><div class="tooltip-arrow" style="position: absolute; left: 0px; transform: translate3d(${x / 6}px, 0px, 0px);"></div><div class="tooltip-inner">Add Document Context</div></div>`);
  document.body.append(t);

  tooltip = t;
}

function deleteTooltip() {
  if (!tooltip) return;

  tooltip.remove();

  tooltip = null;
}

function getFile() {
  let fileInput = document.createElement('input');
  fileInput.type = 'file';

  fileInput.onchange = e => {
    let file = e.target.files[0];

    let reader = new FileReader();
    reader.readAsText(file, 'UTF-8');

    reader.onload = readerEvent => {
      fileContents = readerEvent.target.result;

      if (!queryInput) updateInput();

      queryInput.value += `\n\nAttached file ${file.name}'s contents:\n${fileContents}`;
    }
  }

  fileInput.click();
}

/**
 * @param {String} HTML representing a single element.
 * @param {Boolean} flag representing whether or not to trim input whitespace, defaults to true.
 * @return {Element | HTMLCollection | null}
 */
function fromHTML(html, trim = true) {
  // Process the HTML string.
  html = trim ? html.trim() : html;
  if (!html) return null;

  // Then set up a new template element.
  const template = document.createElement('template');
  template.innerHTML = html;
  const result = template.content.children;

  // Then return either an HTMLElement or HTMLCollection,
  // based on whether the input HTML had one or more roots.
  if (result.length === 1) return result[0];
  return result;
}

function getOffset(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}

function updateInput() {
  queryInput = document.querySelector(queryInputQuerySelector);
}
