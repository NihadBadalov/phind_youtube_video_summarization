// Change all latex codeblocks to normal text
setInterval(() => {
  // Do not change anything if code is being generated
  const stopGenerationButton = document.querySelectorAll('button.btn.btn-no-border.btn-sm.mb-0.mt-1.px-0.py-0.ms-n2.lift:not([style*="visibility: hidden"]) > i.fe.fe-stop-circle.m-2');
  if (stopGenerationButton.length > 0) return;

  const fs5ElementsWithPre = document.querySelectorAll('.fs-5 > pre');
  fs5ElementsWithPre.forEach((fs5Element) => {
    let codeBlockContent = '';
    const codeBlock = fs5Element.querySelector('code.language-latex');
    if (!codeBlock) return;

    // Latex codeblocks have highlights using span
    // so we have a lof ot small parts of text in spans;
    // therefore, we need to get them all together
    const spans = codeBlock.querySelectorAll('span');
    Array.from(spans).forEach(e => codeBlockContent += e.textContent);

    const newParagraph = document.createElement('p');
    newParagraph.className = 'text-black mb-2 text-break';
    newParagraph.textContent = codeBlockContent;

    fs5Element.parentNode.replaceChild(newParagraph, fs5Element);
  });
}, 5_00);

// Load the script
let latexScript = document.createElement('script');
latexScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-AMS_CHTML';
document.head.appendChild(latexScript);

function typesetLaTeX() {
  MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
}

latexScript.onload = function() {
  MathJax.Hub.Config({
    tex2jax: { inlineMath: [['$', '$'], ['\\(', ')'], ['\\(', '\\)'], ['\\[', '\\]']] }
  });

  typesetLaTeX();
  setInterval(typesetLaTeX, 5_00);

  console.log('LATEX INITIALIZED');
};
