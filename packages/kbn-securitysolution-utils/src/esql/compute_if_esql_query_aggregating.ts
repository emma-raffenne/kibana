/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { ESQLAst, getAstAndSyntaxErrors } from '@kbn/esql-ast';

export const isAggregatingQuery = (ast: ESQLAst): boolean => {
  return ast.some((astItem) => astItem.type === 'command' && astItem.name === 'stats');
};

/**
 * compute if esqlQuery is aggregating/grouping, i.e. using STATS...BY command
 * @param esqlQuery
 * @returns boolean
 */
export const computeIsESQLQueryAggregating = (esqlQuery: string): boolean => {
  const { ast } = getAstAndSyntaxErrors(esqlQuery);
  return isAggregatingQuery(ast);
};
