/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import { act } from '@testing-library/react';

import { createIntegrationsTestRendererMock } from '../../../../../../../../mock';
import type { AgentPolicy } from '../../../../../../types';

import { PackagePolicyAgentsCell } from './package_policy_agents_cell';

function renderCell({
  agentCount = 0,
  agentPolicy = {} as AgentPolicy,
  onAddAgent = () => {},
  hasHelpPopover = false,
  canAddAgents = true,
}) {
  const renderer = createIntegrationsTestRendererMock();

  return renderer.render(
    <PackagePolicyAgentsCell
      agentCount={agentCount}
      agentPolicy={agentPolicy}
      onAddAgent={onAddAgent}
      canAddAgents={canAddAgents}
      hasHelpPopover={hasHelpPopover}
    />
  );
}

describe('PackagePolicyAgentsCell', () => {
  test('it should display add agent if count is 0', async () => {
    const utils = renderCell({ agentCount: 0 });
    await act(async () => {
      expect(utils.queryByText('Add agent')).toBeInTheDocument();
    });
  });

  test('it should not display add agent if policy is managed', async () => {
    const utils = renderCell({
      agentCount: 0,
      agentPolicy: {
        is_managed: true,
      } as AgentPolicy,
    });
    await act(async () => {
      expect(utils.queryByText('Add agent')).not.toBeInTheDocument();
    });
  });

  test('it should display only count if count > 0', async () => {
    const utils = renderCell({ agentCount: 9999 });
    await act(async () => {
      expect(utils.queryByText('Add agent')).not.toBeInTheDocument();
      expect(utils.queryByText('9999')).toBeInTheDocument();
    });
  });

  test('it should display help popover if count is 0 and hasHelpPopover=true', async () => {
    const utils = renderCell({ agentCount: 0, hasHelpPopover: true });
    await act(async () => {
      expect(utils.queryByText('9999')).not.toBeInTheDocument();
      expect(utils.queryByText('Add agent')).toBeInTheDocument();
      expect(
        utils.container.querySelector('[data-test-subj="addAgentHelpPopover"]')
      ).toBeInTheDocument();
    });
  });
  test('it should not display help popover if count is > 0 and hasHelpPopover=true', async () => {
    const utils = renderCell({ agentCount: 9999, hasHelpPopover: true });
    await act(async () => {
      expect(utils.queryByText('9999')).toBeInTheDocument();
      expect(utils.queryByText('Add agent')).not.toBeInTheDocument();
      expect(
        utils.container.querySelector('[data-test-subj="addAgentHelpPopover"]')
      ).not.toBeInTheDocument();
    });
  });
  test('it should be disabled if canAddAgents is false', async () => {
    const utils = renderCell({ agentCount: 0, canAddAgents: false });
    await act(async () => {
      expect(utils.container.querySelector('[data-test-subj="addAgentButton"]')).toBeDisabled();
    });
  });
});
