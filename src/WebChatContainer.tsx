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

import React, { ReactNode, useEffect, useState } from 'react';
import { CustomResponsePortalsContainer } from './CustomResponsePortalsContainer';
import { withWebChat } from './withWebChat';
import { AddedWithWebChatProps } from './types/types';
import { WebChatConfig } from './types/WebChatConfig';
import { WebChatInstance } from './types/WebChatInstance';

interface WebChatContainerProps {
  /**
   * The config to use to load web chat. Note that the "onLoad" property is overridden by this component. If you
   * need to perform any actions after web chat been loaded, use the "onBeforeRender" prop.
   */
  config: WebChatConfig;

  /**
   * This function is called before the render function of web chat is called. This function can return a Promise
   * which will cause web chat to wait for it before rendering.
   */
  onBeforeRender?: (instance: WebChatInstance) => Promise<void>;

  /**
   * This is the function that this component will call when a custom response should be rendered.
   */
  renderCustomResponse?: (event: CustomResponseEvent, instance: WebChatInstance) => ReactNode;
}

/**
 * This is a component wrapper for using the withWebChat high-order-component as well as for providing support for
 * handling custom responses in portals.  This can be rendered anywhere in your application but you should make sure
 * it doesn't get unmounted during in the middle of your App's life or it will lose any custom responses that were
 * previously received.
 *
 * Note that this container will override any config.onLoad property you have set. If you need access to the web
 * chat instance or need to perform additional customizations of web chat when it loads, use the onBeforeRender
 * callback prop to this component.
 */
function WebChatContainer({ onBeforeRender, renderCustomResponse, config }: WebChatContainerProps) {
  return (
    <WebChatContainerWithWebChat
      onBeforeRender={onBeforeRender}
      renderCustomResponse={renderCustomResponse}
      config={config}
    />
  );
}

type WebChatContainerInternalProps = WebChatContainerProps & AddedWithWebChatProps;

/**
 * This is the internal component that is passed the createWebChatInstance function for creating web chat.
 */
const WebChatContainerInternal = ({
  createWebChatInstance,
  onBeforeRender,
  renderCustomResponse,
  config,
}: WebChatContainerInternalProps) => {
  const [webChatInstance, setWebChatInstance] = useState<WebChatInstance>();

  useEffect(() => {
    async function onWebChatLoad(instance: WebChatInstance) {
      if (onBeforeRender) {
        await onBeforeRender(instance);
      }
      instance.render();
      setWebChatInstance(instance);
    }

    // Add the onLoad handler to the existing web chat options in the external config.js file.
    const webChatOptions = {
      ...config,
      onLoad: onWebChatLoad,
    };

    createWebChatInstance(webChatOptions);
  }, []);

  if (renderCustomResponse && webChatInstance) {
    return <CustomResponsePortalsContainer webChatInstance={webChatInstance} renderResponse={renderCustomResponse} />;
  }

  return null;
};

const WebChatContainerWithWebChat = withWebChat()(WebChatContainerInternal);

export { WebChatContainer, WebChatContainerProps };
