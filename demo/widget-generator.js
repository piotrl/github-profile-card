(function () {
  'use strict';

  const attributes = {
    username: 'data-username',
    maxRepos: 'data-max-repos',
    sortBy: 'data-sort-by',
    headerText: 'data-header-text',
  };

  window.widgetGenerator = {
    regenerate: regenerate,
  };

  function regenerate(options) {
    const attributesTemplate = Object.keys(options)
      .map((option) => {
        const attribute = attributes[option];
        const value = options[option];
        if (!attribute) {
          return '';
        }
        return `\n\t${attribute}="${value}"`;
      })
      .join('');

    return `<div id="github-card" ${attributesTemplate}>\n</div>`;
  }
})();
