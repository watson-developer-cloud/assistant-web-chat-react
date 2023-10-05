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

import React, { ReactNode, useEffect, useState, MutableRefObject, useRef } from 'react';
import { CustomResponsePortalsContainer } from './CustomResponsePortalsContainer';
import { WebChatConfig } from './types/WebChatConfig';
import { WebChatInstance } from './types/WebChatInstance';
import { CustomResponseEvent } from './types/CustomResponseEvent';

// The default host URL where the production version of web chat is hosted.
const DEFAULT_BASE_URL = 'https://web-chat.global.assistant.watson.appdomain.cloud';

// Indicate if debugging is enabled.
let debug = false;

interface ManagedWebChat {
  /**
   * The config for the web chat that is loaded.
   */
  webChatConfig: WebChatConfig;

  /**
   * Indicates if this instance of the web chat should be or has been destroyed.
   */
  shouldDestroy: boolean;

  /**
   * The instance of web chat that was loaded.
   */
  instance: WebChatInstance;
}

interface WebChatContainerProps {
  /**
   * The config to use to load web chat. Note that the "onLoad" property is overridden by this component. If you
   * need to perform any actions after web chat been loaded, use the "onBeforeRender" or "onAfterRender" props.
   */
  config: WebChatConfig;

  /**
   * This function is called before the render function of web chat is called. This function can return a Promise
   * which will cause web chat to wait for it before rendering.
   */
  onBeforeRender?: (instance: WebChatInstance) => Promise<void>;

  /**
   * This function is called after the render function of web chat is called. This function can return a Promise
   * which will cause web chat to wait for it before rendering.
   */
  onAfterRender?: (instance: WebChatInstance) => Promise<void>;

  /**
   * This is the function that this component will call when a custom response should be rendered.
   */
  renderCustomResponse?: (event: CustomResponseEvent, instance: WebChatInstance) => ReactNode;

  /**
   * A convenience prop that is a reference to the web chat instance. This component will set the value of this ref
   * when the instance has been created.
   */
  instanceRef?: MutableRefObject<WebChatInstance>;

  /**
   * Set the url where web chat assets are hosted. Used for development purposes.
   */
  hostURL?: string;
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
function WebChatContainer({
  onBeforeRender,
  onAfterRender,
  renderCustomResponse,
  config,
  instanceRef,
  hostURL,
}: WebChatContainerProps) {
  // A state value that contains the current instance of web chat.
  const [instance, setInstance] = useState<WebChatInstance>();

  // The most recent web chat that was load by this component.
  const managedWebChatRef = useRef<ManagedWebChat>();

  // The previous web chat config.
  const previousConfigRef = useRef<WebChatConfig>();

  useEffect(() => {
    const previousConfig = previousConfigRef.current;
    previousConfigRef.current = config;

    if (previousConfig !== config) {
      // Each time the web chat config settings change (or this component is mounted), we need to destroy any previous
      // web chat and create a new web chat.
      destroyWebChat(managedWebChatRef.current, setInstance, instanceRef);

      // We'll use this managed object to keep track of the web chat instance we are creating for this effect.
      const managedWebChat: ManagedWebChat = {
        instance: null,
        shouldDestroy: false,
        webChatConfig: config,
      };
      managedWebChatRef.current = managedWebChat;

      logger(managedWebChat.webChatConfig, `Creating a new web chat due to configuration change.`);

      // Kick off the creation of a new web chat. This is multistep, asynchronous process.
      loadWebChat(managedWebChat, hostURL, setInstance, instanceRef, onBeforeRender, onAfterRender).catch((error) => {
        logger(managedWebChat.webChatConfig, 'An error occurred loading web chat', error);
        destroyWebChat(managedWebChat, setInstance, instanceRef);
      });

      return () => {
        logger(managedWebChat.webChatConfig, `Destroying web chat due to component unmounting.`);
        destroyWebChat(managedWebChat, setInstance, instanceRef);
        previousConfigRef.current = null;
      };
    }
    return undefined;
  }, [config, hostURL]);

  if (renderCustomResponse && instance) {
    return <CustomResponsePortalsContainer webChatInstance={instance} renderResponse={renderCustomResponse} />;
  }

  return null;
}

/**
 * Loads a new instance of web chat.
 */
async function loadWebChat(
  managedWebChat: ManagedWebChat,
  hostURL: string,
  setInstance: (instance: WebChatInstance) => void,
  instanceRef: MutableRefObject<WebChatInstance>,
  onBeforeRender: (instance: WebChatInstance) => Promise<void>,
  onAfterRender: (instance: WebChatInstance) => Promise<void>,
) {
  const { webChatConfig } = managedWebChat;

  // The first step is to make sure the javascript for web chat is loaded.
  await ensureWebChatScript(webChatConfig, hostURL);

  if (managedWebChat.shouldDestroy) {
    logger(webChatConfig, `Destroying web chat before an instance is created.`);
    destroyWebChat(managedWebChat, setInstance, instanceRef);
    return;
  }

  // Now create an instance of web chat.
  if (webChatConfig.onLoad) {
    const message =
      'Do not use onLoad in the web chat config. Use the WebChatContainer onBeforeRender or onAfterRender prop instead.';
    logger(webChatConfig, message);
  }
  logger(webChatConfig, `Creating web chat instance.`);
  const configWithoutOnLoad: WebChatConfig = {
    ...webChatConfig,
    onLoad: null,
  };
  const instance = await window.loadWatsonAssistantChat(configWithoutOnLoad);

  // Once the instance is created, call the onBeforeRender and then render and then onAfterRender.
  await onBeforeRender?.(instance);
  logger(webChatConfig, `Calling render.`);
  await instance.render();
  await onAfterRender?.(instance);

  // Update the state of the parent component with the instance.
  setInstance(instance);
  managedWebChat.instance = instance;
  if (instanceRef) {
    instanceRef.current = instance;
  }

  if (managedWebChat.shouldDestroy) {
    logger(webChatConfig, `Destroying web chat after an instance is created but before calling onLoad.`);
    destroyWebChat(managedWebChat, setInstance, instanceRef);
  }
}

/**
 * Destroys an instance of web chat and marks it destroyed.
 */
function destroyWebChat(
  managedWebChat: ManagedWebChat,
  setInstance: (instance: WebChatInstance) => void,
  instanceRef: MutableRefObject<WebChatInstance>,
) {
  if (managedWebChat) {
    if (managedWebChat.instance) {
      logger(managedWebChat.webChatConfig, `Destroying web chat instance.`);
      managedWebChat.instance.destroy();
    }

    managedWebChat.shouldDestroy = true;
    managedWebChat.instance = null;
  }
  setInstance(null);
  if (instanceRef) {
    instanceRef.current = null;
  }
}

/**
 * A public function that can be used to turn logging off or on.
 */
function setEnableDebug(enableDebug: boolean) {
  debug = enableDebug;
}

/**
 * A convenience function for logging to the console.
 */
function logger(webChatConfig: WebChatConfig, ...args: unknown[]) {
  if (debug) {
    const namespaceLabel = webChatConfig?.namespace ? `: Namespace ${webChatConfig.namespace}` : '';
    // eslint-disable-next-line no-console
    console.log(`[IBM watsonx Assistant WebChatContainer${namespaceLabel}]`, ...args);
  }
}

/**
 * Ensures that the javascript for web chat has been loaded.
 */
async function ensureWebChatScript(webChatConfig: WebChatConfig, hostURL: string) {
  const useURL = hostURL || DEFAULT_BASE_URL;
  const scriptURL = `${useURL.replace(/\/$/, '')}/versions/${
    webChatConfig.clientVersion || 'latest'
  }/WatsonAssistantChatEntry.js`;

  const loadedWebChatURL = (window as any).wacWebChatContainerScriptURL;
  if (loadedWebChatURL && loadedWebChatURL !== scriptURL) {
    const message = `Web chat has already been loaded using a different URL (${loadedWebChatURL}). This component does not support loading web chat using multiple URLs including different versions of web chat. The current code attempted to load from ${scriptURL}.`;
    logger(null, message);
  }

  // Check to see if we already have a Promise for loading this script. We're using a window property to cover the
  // case where multiple library instances are being used that can't necessarily share module state.
  if (!(window as any).wacWebChatContainerScriptPromise) {
    logger(null, `Loading the web chat javascript from ${scriptURL}.`);

    (window as any).wacWebChatContainerScriptPromise = new Promise<void>((resolve, reject) => {
      const scriptElement = document.createElement('script');
      scriptElement.onload = () => resolve();
      scriptElement.onerror = () => reject();
      scriptElement.src = scriptURL;
      document.head.appendChild(scriptElement);
      (window as any).wacWebChatContainerScriptURL = scriptURL;
    });
  }

  return (window as any).wacWebChatContainerScriptPromise;
}

export { setEnableDebug, WebChatContainer, WebChatContainerProps, ensureWebChatScript };
