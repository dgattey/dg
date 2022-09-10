/**
 * These are all the icon libs we want to disallow direct imports from
 */
const ALL_ICON_LIBS = ['@fortawesome/free-brands-svg-icons', '@fortawesome/free-solid-svg-icons'];

/**
 * Rule to make sure an ImportDeclaration doesn't directly import a full
 * font-awesome package since it prevents tree shaking.
 *
 * @param {import('./types').Context } context
 * @returns {import('./types').RuleListener['ImportDeclaration']}
 */
const importDeclarationRule = (context) => (node) => {
  const { range } = node;

  // We want to allow importing types from those packages
  if (node.importKind === 'type' || !range) {
    return;
  }

  /**
   * Actually fixes a node by inserting import statements that have the icon import in
   * the package name (making sure to handle multiple imports from one icon package).
   * @type {import('./types').ReportArguments['fix']}
   */
  const fix = (fixer) => {
    const replacements = node.specifiers.map((specifier, index) => {
      const isLast = index === node.specifiers.length - 1;
      const newLine = isLast ? '' : '\n';
      return fixer.insertTextAfterRange(
        range,
        `import {${specifier.local.name}} from '${node.source.value}/${specifier.local.name}';${newLine}`,
      );
    });
    return [fixer.removeRange(range), ...replacements];
  };

  // Report an error if the package name is one of the disallowed packages of icons
  ALL_ICON_LIBS.forEach((iconLib) => {
    if (node.source?.value === iconLib) {
      context.report({
        node,
        messageId: 'noImportsAlone',
        data: {
          iconLib,
        },
        fix,
      });
    }
  });
};

/**
 * Our full rule, with meta + function to create it
 *
 * @type {import('./types').Rule}
 */
const rule = {
  create: (context) => ({
    // Only imports need to be linted by this rule
    ImportDeclaration: importDeclarationRule(context),
  }),
  defaultOptions: [],
  meta: {
    type: 'problem',
    messages: {
      noImportsAlone: "No imports from '{{ iconLib }}' alone",
    },
    fixable: 'code',
    schema: [],
  },
};

module.exports = rule;
