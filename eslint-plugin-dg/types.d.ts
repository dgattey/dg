/* eslint-disable no-unused-vars */
import type { rules } from '@typescript-eslint/eslint-plugin';

type ValueOf<T> = T[keyof T];

/**
 * A full rule has this type
 */
export type Rule = ValueOf<typeof rules>;

/**
 * Type of the create function itself for a rule
 */
export type Create = Rule['create'];

type Range = [number, number];

/**
 * A node for all of these rules
 */
export type ESLintNode = {
  range: Range;
  importKind?: 'type' | 'value';
  source: {
    value: string;
  };
  specifiers: Array<{
    type: 'ImportSpecifier';
    local: {
      name: string;
    };
    imported: {
      name: string;
    };
  }>;
};

type FixResult = {
  range: Range;
  text: string;
};

/**
 * The fixer function to change a node
 */
export type Fixer = (fixer: {
  insertTextAfterRange: (range: Range, text: string) => FixResult;
  removeRange: (range: Range) => FixResult;
}) => Array<FixResult>;

/**
 * The context used in the Create function
 */
export type Context = {
  report: (args: {
    node: ESLintNode;
    messageId: string;
    data?: Record<string, string>;
    fix?: Fixer;
  }) => void;
};

/**
 * A rule that uses an import declaration
 */
export type ImportDeclarationRule = (node: ESLintNode) => void;
