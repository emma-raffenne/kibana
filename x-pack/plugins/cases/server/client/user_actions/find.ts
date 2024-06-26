/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { UserActionFindResponse } from '../../../common/types/api';
import { UserActionFindRequestRt, UserActionFindResponseRt } from '../../../common/types/api';
import { decodeWithExcessOrThrow, decodeOrThrow } from '../../common/runtime_types';
import type { CasesClientArgs } from '../types';
import type { UserActionFind } from './types';
import { Operations } from '../../authorization';
import { formatSavedObjects } from './utils';
import { createCaseError } from '../../common/error';
import { asArray } from '../../common/utils';
import type { CasesClient } from '../client';

export const find = async (
  { caseId, params }: UserActionFind,
  casesClient: CasesClient,
  clientArgs: CasesClientArgs
): Promise<UserActionFindResponse> => {
  const {
    services: { userActionService },
    logger,
    authorization,
  } = clientArgs;

  try {
    // supertest and query-string encode a single entry in an array as just a string so make sure we have an array
    const types = asArray(params.types);

    const queryParams = decodeWithExcessOrThrow(UserActionFindRequestRt)({ ...params, types });

    const [authorizationFilterRes] = await Promise.all([
      authorization.getAuthorizationFilter(Operations.findUserActions),
      // ensure that we have authorization for reading the case
      casesClient.cases.resolve({ id: caseId, includeComments: false }),
    ]);

    const { filter: authorizationFilter, ensureSavedObjectsAreAuthorized } = authorizationFilterRes;

    const userActions = await userActionService.finder.find({
      caseId,
      ...queryParams,
      filter: authorizationFilter,
    });

    ensureSavedObjectsAreAuthorized(
      userActions.saved_objects.map((so) => ({ owner: so.attributes.owner, id: so.id }))
    );

    const res = {
      userActions: formatSavedObjects(userActions),
      page: userActions.page,
      perPage: userActions.per_page,
      total: userActions.total,
    };

    return decodeOrThrow(UserActionFindResponseRt)(res);
  } catch (error) {
    throw createCaseError({
      message: `Failed to find user actions for case id: ${caseId}: ${error}`,
      error,
      logger,
    });
  }
};
