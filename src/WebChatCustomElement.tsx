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

import React, { useCallback, useMemo, useState } from 'react';
import { WebChatContainer, WebChatContainerProps } from './WebChatContainer';
import { WebChatInstance } from './types/WebChatInstance';

const CUSTOM_ELEMENT_STYLES = `
#WACContainer.WACContainer .HideWebChat { display: none }
.CustomElementHideWebChat { width: 0; height: 0 }
`;

interface WebChatCustomElementProps extends WebChatContainerProps {
  /**
   * An optional classname that will be added to the custom element.
   */
  className?: string;

  /**
   * An optional id that will be added to the custom element.
   */
  id?: string;

  /**
   * An optional listener for "view:change" events. Such a listener is required when using a custom element in order
   * to control the visibility of the web chat main window. If no callback is provided here, a default one will be
   * used that injects styling into the app that will show and hide the web chat main window and also change the
   * size of the custom element so it doesn't take up space when the main window is closed.
   *
   * You can provide a different callback here if you want custom behavior such as an animation when the main window
   * is opened or closed.
   *
   * Note that this function can only be provided before web chat is loaded. After web chat is loaded, the event
   * handler will not be updated.
   */
  onViewChange?: (event: any, instance: WebChatInstance) => void;
}

/**
 * This component can be used if you want to render web chat inside a custom element. It will perform two functions:
 *
 * 1. It will create the custom element as part of the React application.
 * 2. It will attach web chat to the custom element and use the WebChatContainer component to manage the life cycle
 * of the web chat instance.
 */
function WebChatCustomElement(props: WebChatCustomElementProps) {
  const { className, id, onViewChange, config, onBeforeRender, ...containerProps } = props;
  const [customElement, setCustomElement] = useState<HTMLDivElement>();

  // Make sure to memoize the config object. If we pass a new object to WebChatContainer (even if all the properties
  // inside of it are the same), the container will just continually destroy and recreate the web chat instance
  // because it thinks the config keeps changing.
  const useConfig = useMemo(() => {
    return {
      ...config,
      element: customElement,
    };
  }, [config, customElement]);

  const onBeforeRenderOverride = useCallback(
    async (instance: WebChatInstance) => {
      /**
       * A default handler for the "view:change" event. This will be used to show or hide the web chat main window
       * using a simple classname.
       */
      function defaultViewChangeHandler(event: any, instance: WebChatInstance) {
        if (event.newViewState.mainWindow) {
          customElement.classList.remove('CustomElementHideWebChat');
          instance.elements.getMainWindow().removeClassName('HideWebChat');
        } else {
          customElement.classList.add('CustomElementHideWebChat');
          instance.elements.getMainWindow().addClassName('HideWebChat');
        }
      }

      instance.on({ type: 'view:change', handler: onViewChange || defaultViewChangeHandler });

      return onBeforeRender?.(instance);
    },
    [onBeforeRender, onViewChange, customElement],
  );

  return (
    <>
      <div className={className} id={id} ref={setCustomElement} />
      {!onViewChange && <style>{CUSTOM_ELEMENT_STYLES}</style>}
      {customElement && (
        <WebChatContainer config={useConfig} onBeforeRender={onBeforeRenderOverride} {...containerProps} />
      )}
    </>
  );
}

export { WebChatCustomElement };
