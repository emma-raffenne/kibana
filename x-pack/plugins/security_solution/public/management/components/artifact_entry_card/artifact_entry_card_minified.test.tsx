/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { memo } from 'react';
import type { AppContextTestRender } from '../../../common/mock/endpoint';
import { createAppRootMockRenderer } from '../../../common/mock/endpoint';
import type { ArtifactEntryCardMinifiedProps } from './artifact_entry_card_minified';
import { ArtifactEntryCardMinified } from './artifact_entry_card_minified';
import { act, fireEvent } from '@testing-library/react';
import type { AnyArtifact } from './types';
import { getTrustedAppProviderMock, getExceptionProviderMock } from './test_utils';
import type { ArtifactEntryCardDecoratorProps } from './artifact_entry_card';

describe.each([
  ['trusted apps', getTrustedAppProviderMock],
  ['exceptions/event filters', getExceptionProviderMock],
])('when using the ArtifactEntryCardMinified component with %s', (_, generateItem) => {
  let item: AnyArtifact;
  let appTestContext: AppContextTestRender;
  let renderResult: ReturnType<AppContextTestRender['render']>;
  let render: (props: ArtifactEntryCardMinifiedProps) => ReturnType<AppContextTestRender['render']>;
  let onToggleSelectedArtifactMock: jest.Mock;

  beforeEach(() => {
    onToggleSelectedArtifactMock = jest.fn();
    item = generateItem();
    appTestContext = createAppRootMockRenderer();
    render = (props) => {
      renderResult = appTestContext.render(
        <ArtifactEntryCardMinified
          {...{
            'data-test-subj': 'testCard',
            ...props,
          }}
        />
      );
      return renderResult;
    };
  });

  it('should display title', async () => {
    render({ item, isSelected: false, onToggleSelectedArtifact: onToggleSelectedArtifactMock });

    expect(renderResult.getByTestId('testCard-title').textContent).toEqual('some internal app');
  });

  it('should display description if one exists', async () => {
    render({ item, isSelected: false, onToggleSelectedArtifact: onToggleSelectedArtifactMock });

    expect(renderResult.getByTestId('testCard-description').textContent).toEqual(item.description);
  });

  it('should display default empty value if description does not exist', async () => {
    item.description = undefined;
    render({ item, isSelected: false, onToggleSelectedArtifact: onToggleSelectedArtifactMock });

    expect(renderResult.getByTestId('testCard-description').textContent).toEqual('—');
  });

  it('should collapse/uncollapse critera conditions', async () => {
    render({ item, isSelected: false, onToggleSelectedArtifact: onToggleSelectedArtifactMock });

    expect(renderResult.getByTestId('testCard-collapse').textContent).toEqual('Show details');
    await act(async () => {
      await fireEvent.click(renderResult.getByTestId('testCard-collapse'));
    });
    expect(renderResult.getByTestId('testCard-criteriaConditions').textContent).toEqual(
      ' OSIS WindowsAND process.hash.*IS 1234234659af249ddf3e40864e9fb241AND process.executable.caselessIS c:\\fol\\bin.exe'
    );
    expect(renderResult.getByTestId('testCard-collapse').textContent).toEqual('Hide details');
  });

  it('should select artifact when unselected by default', async () => {
    render({ item, isSelected: false, onToggleSelectedArtifact: onToggleSelectedArtifactMock });

    expect(onToggleSelectedArtifactMock).toHaveBeenCalledTimes(0);
    await act(async () => {
      await fireEvent.click(renderResult.getByTestId(`${item.name}_checkbox`));
    });
    expect(onToggleSelectedArtifactMock).toHaveBeenCalledTimes(1);
    expect(onToggleSelectedArtifactMock).toHaveBeenCalledWith(true);
  });

  it('should select artifact when selected by default', async () => {
    render({ item, isSelected: true, onToggleSelectedArtifact: onToggleSelectedArtifactMock });

    expect(onToggleSelectedArtifactMock).toHaveBeenCalledTimes(0);
    await act(async () => {
      await fireEvent.click(renderResult.getByTestId(`${item.name}_checkbox`));
    });
    expect(onToggleSelectedArtifactMock).toHaveBeenCalledTimes(1);
    expect(onToggleSelectedArtifactMock).toHaveBeenCalledWith(false);
  });

  it('should pass item to Decorator component and display the component', () => {
    let passedItem: ArtifactEntryCardDecoratorProps['item'] | null = null;
    const MockDecorator = memo<ArtifactEntryCardDecoratorProps>(({ item: actualItem }) => {
      passedItem = actualItem;
      return <p>{'mock decorator'}</p>;
    });
    MockDecorator.displayName = 'MockDecorator';

    render({
      item,
      isSelected: false,
      onToggleSelectedArtifact: onToggleSelectedArtifactMock,
      Decorator: MockDecorator,
    });

    expect(renderResult.getByText('mock decorator')).toBeInTheDocument();
    expect(passedItem).toBe(item);
  });
});
