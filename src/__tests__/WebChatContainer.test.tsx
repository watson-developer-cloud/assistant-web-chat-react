/**
 * (C) Copyright IBM Corp. 2022.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 * https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 *
 */

import React, { MutableRefObject } from 'react';
import { render } from '@testing-library/react';
import { WebChatContainer, WebChatContainerProps } from '../WebChatContainer';
import { TEST_INSTANCE_CONFIG, waitForFind, waitForWebChat } from '../test/testUtils';
import { WebChatInstance } from '../types/WebChatInstance';
import { CustomResponseEvent } from '../types/CustomResponseEvent';

jest.setTimeout(20000);

describe('WebChatContainer', () => {
  it('tests that the component loads web chat', async () => {
    const component = <WebChatContainer config={TEST_INSTANCE_CONFIG} />;
    const { findAllByPlaceholderText } = render(component);
    await waitForWebChat(findAllByPlaceholderText);
  });

  it('tests that the component loads a different web chat when the config changes', async () => {
    const { findAllByPlaceholderText, rerender, findAllByLabelText } = render(
      <WebChatContainer config={TEST_INSTANCE_CONFIG} />,
    );
    await waitForWebChat(findAllByPlaceholderText);

    rerender(
      <WebChatContainer
        config={{
          ...TEST_INSTANCE_CONFIG,
          showCloseAndRestartButton: true,
        }}
      />,
    );

    await waitForWebChat(findAllByPlaceholderText);
    // This second configuration should display the close and restart button.
    await waitForFind('End chat and close the window', findAllByLabelText);
  });

  it('tests that the component renders correctly when mounted, unmounted and re-mounted', async () => {
    // This is basically what the React 18 strict mode does in development mode.
    const { findAllByPlaceholderText, rerender } = render(<WebChatContainer config={TEST_INSTANCE_CONFIG} />);
    rerender(<div />);
    rerender(<WebChatContainer config={TEST_INSTANCE_CONFIG} />);

    await waitForWebChat(findAllByPlaceholderText);
  });

  it('tests that the component renders custom responses', async () => {
    const instanceRef: MutableRefObject<WebChatInstance> = { current: null };
    let webChatInstance: WebChatInstance;
    let webChatAfterInstance: WebChatInstance;

    // We'll use this map to assign a unique number to each event so we can generate a unique custom response for
    // each message and make sure they are rendered correctly.
    const eventMap = new Map<CustomResponseEvent, number>();

    const onBeforeRender: WebChatContainerProps['onBeforeRender'] = async (instance) => {
      webChatInstance = instance;
    };

    const onAfterRender: WebChatContainerProps['onAfterRender'] = async (instance) => {
      webChatAfterInstance = instance;
    };

    const renderCustomResponse: WebChatContainerProps['renderCustomResponse'] = (event) => {
      let count = eventMap.get(event);
      if (!count) {
        count = eventMap.size + 1;
        eventMap.set(event, count);
      }
      return <div>This is a custom response! Count: {count}.</div>;
    };

    const component = (
      <WebChatContainer
        config={TEST_INSTANCE_CONFIG}
        onBeforeRender={onBeforeRender}
        onAfterRender={onAfterRender}
        renderCustomResponse={renderCustomResponse}
        instanceRef={instanceRef}
      />
    );
    const { findAllByText, queryAllByText, findAllByPlaceholderText } = render(component);

    await waitForWebChat(findAllByPlaceholderText);

    // Send a message to get the first custom response.
    webChatInstance.send({ input: { text: 'custom response' } });

    await waitForFind('This is a custom response! Count: 1.', findAllByText);
    expect(queryAllByText('This is a custom response! Count: 2.', { exact: false }).length).toEqual(0);

    // Send a message to get the second custom response and make sure both custom responses appear.
    webChatInstance.send({ input: { text: 'custom response' } });

    await waitForFind('This is a custom response! Count: 2.', findAllByText);
    await waitForFind('This is a custom response! Count: 1.', findAllByText);
    expect(queryAllByText('This is a custom response! Count: 3.', { exact: false }).length).toEqual(0);

    expect(instanceRef.current).toBe(webChatInstance);
    expect(instanceRef.current).toBe(webChatAfterInstance);
  });
});
