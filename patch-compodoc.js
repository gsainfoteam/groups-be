#!/usr/bin/env node
const fs = require('fs');

const compoMod = `${process.cwd()}/node_modules/@compodoc/compodoc`;
const updates = [
  {
    // filename 'index-cli-Cr-tk_1e.js' is unique to compodoc v1.1.24, this will need to be updated to reflect the correct path for whichever version you're on
    target: `${compoMod}/dist/index-cli-D7g1_4MM.js`,
    search: `if (!language) {`,
    replace: `if (language === 'mermaid') {
      //  setting the mermaid css class will enable the diagram to be rendered
      return '<div class="mermaid">'+code+'</div>';
  }
  if (!language) {`,
  },
  {
    target: `${compoMod}/src/templates/page.hbs`,
    search: `<script src="{{relativeURL data.depth }}js/lazy-load-graphs.js"></script>`,
    replace: `<script src="{{relativeURL data.depth }}js/lazy-load-graphs.js"></script>
    <!-- loading mermaid library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mermaid/10.9.1/mermaid.min.js"></script>`,
  },
];

for (const update of updates) {
  const data = fs.readFileSync(update.target);
  const patched = data.toString().replace(update.search, update.replace);
  fs.writeFileSync(update.target, patched);
}
console.log('successfully patched compodoc');
