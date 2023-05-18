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

/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-underscore-dangle */

import React from 'react';
import { loadWebChatScript as loadWebChatScriptNew } from './WebChatContainer';
import { WithWebChatConfig, OriginalProps, ForwardedRefProps, WithWebChatProps } from './types/WithWebChatTypes';
import { WebChatConfig } from './types/WebChatConfig';
import { WebChatInstance } from './types/WebChatInstance';

const DEFAULT_BASE_URL = 'https://web-chat.global.assistant.watson.appdomain.cloud';

// When withWebChat is first used, loadWebChatScript promise will be set to loadWebChatScript(baseUrl).
// This way we can have multiple withWebChat instances listen to this same promise.
let loadWebChatScriptPromise: Promise<unknown>;

/**
 * Injects a method to create an instance of web chat into the props for the component.
 *
 * withWebChat takes a component and a config argument. The config argument contains two parameters.
 * First, a "debug" option that takes a boolean. When turned on, this will add console.logs outlying the status of the
 * web chat during each step of build and tear down. The second parameter is baseUrl. This is used to identify where
 * the web chat should load from. config.baseUrl is used for internal debugging and development purposes, so you
 * shouldn't have to touch that normally.
 */
function withWebChat(passedConfig: WithWebChatConfig = {}) {
  return function withWebChatWithConfig<T>(
    WrappedComponent: React.ComponentType<T>,
  ): React.ForwardRefExoticComponent<React.PropsWithoutRef<OriginalProps<T>> & React.RefAttributes<unknown>> {
    const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

    function WithWebChat(props: WithWebChatProps<OriginalProps<T>>) {
      const config = {
        baseUrl: passedConfig.baseUrl || DEFAULT_BASE_URL,
        debug: passedConfig.debug || false,
      };

      // We track the passed web chat config and the promise that the web chat script has been loaded in state.
      const [webChatConfig, setWebChatConfig] = React.useState<WebChatConfig>();
      const webChatLoadedPromise = React.useRef(
        new Deferred<(passedWebChatConfig: WebChatConfig) => Promise<WebChatInstance>>(),
      );

      /**
       * This function is passed as a prop. We are not able to immediately work to create an instance of web chat until
       * the external script loads so we await createWebChatInstanceReady being resolved. We also need to be able to
       * keep track of if the component is still mounted in all our promises, so we use createWebChatInstanceInternal
       * that is able to keep track of mounted state.
       */
      async function createWebChatInstance(passedWebChatConfig: WebChatConfig) {
        setWebChatConfig(passedWebChatConfig);
        const createWebChatInstanceInternal = await webChatLoadedPromise.current.promise;
        return createWebChatInstanceInternal(passedWebChatConfig);
      }

      // This effect only runs when createWebChatInstance is called. It contains a lot of promises while loading up web chat.
      // Each of these promises checks if isMounted is still set to true before continuing. When the component unmounts,
      // isMounted is set to false. This gives us safety from quick mounting and unmounting that can create problems
      // if we don't stop the promises from continuing to run.
      React.useEffect(() => {
        let isMounted = true;
        let instance: WebChatInstance;

        // If config.debug is true, this method will console.log out the passed messages, prefixed by an identifier to
        // separate from non web chat console.log traffic.
        function logger(...args: unknown[]) {
          if (config.debug) {
            // eslint-disable-next-line no-console
            console.log(
              `[Watson Assistant withWebChat${
                webChatConfig && webChatConfig.namespace ? `: Namespace "${webChatConfig.namespace}"` : ''
              }]`,
              args,
            );
          }
        }

        // This function manages all the steps to load a web chat and pass the instance back in a promise. It manages making sure
        // the component is still mounted as it runs through async steps and any clean up of the instance on failures.
        // eslint-disable-next-line consistent-return
        async function createWebChatInstanceTemplate(passedWebChatConfig: WebChatConfig): Promise<WebChatInstance> {
          if (isMounted) {
            logger('creating web chat instance');
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const onLoadReference = passedWebChatConfig.onLoad || function noop() {};

            // Wait for this version of web chat to load.
            try {
              if (instance) {
                // eslint-disable-next-line no-console
                console.warn(
                  '[Watson Assistant withWebChat] createWebChatInstance has already been called... destroying previous instance.',
                );
                instance.destroy();
              }
              if (window.loadWatsonAssistantChat) {
                logger('web chat instance being created');
                instance = await window.loadWatsonAssistantChat(passedWebChatConfig);
              } else {
                throw new Error('window.loadWatsonAssistantChat is undefined');
              }
              if (isMounted) {
                logger('web chat instance created and returned to component');
                onLoadReference(instance);
              } else if (instance) {
                logger('web chat instance created but component unmounted...destroying instance and aborting.');
                instance.destroy();
              }
              return instance;
            } catch (error) {
              if (instance) {
                logger('web chat failed to create instance...destroying instance and aborting.');
                instance.destroy();
              } else {
                logger('web chat failed to create instance...aborting.');
              }
              // Throw the error back upstream to be handled inside the component.
              throw new Error(error);
            }
          } else {
            logger('web chat instance ready to be created, but component unmounted...aborting.');
            return instance;
          }
        }

        if (webChatConfig) {
          logger('createWebChatInstance called');
          // If the script tag for web chat has not been injected on the page, do so now.
          if (!loadWebChatScriptPromise) {
            logger('appending web chat scripts to body');
            loadWebChatScriptPromise = loadWebChatScript(webChatConfig, config.baseUrl);
          }

          loadWebChatScriptPromise
            .then(() => {
              logger('web chat script loaded');
              if (isMounted) {
                logger('web chat script loaded and component is still mounted. Setting createWebChatInstance.');
                webChatLoadedPromise.current.resolve(createWebChatInstanceTemplate);
              } else {
                logger('web chat script loaded and component is no longer mounted...aborting.');
              }
            })
            .catch((error) => {
              logger('web chat script failed', error);
              if (isMounted) {
                logger('web chat script failed to load. createWebChatInstance will reject.');
                webChatLoadedPromise.current.reject(
                  `[Watson Assistant withWebChat${
                    webChatConfig && webChatConfig.namespace ? `: Namespace "${webChatConfig.namespace}"` : ''
                  }] web chat failed to load.`,
                );
              } else {
                logger('web chat script failed to load and component is no longer mounted...aborting.');
              }
            });
        }

        return () => {
          // By setting isMounted to false, we prevent post async code from running when the component is no longer mounted.
          isMounted = false;
          if (webChatConfig) {
            if (instance) {
              logger('component has unmounted...destroying web chat instance and aborting');
              instance.destroy();
            } else {
              logger('component has unmounted before web chat instance was created...aborting');
            }
          }
        };
      }, [webChatConfig, webChatLoadedPromise]);

      const { forwardedRef, ...restPropsTemp } = props as ForwardedRefProps;
      const rest = restPropsTemp as T;
      return <WrappedComponent {...rest} ref={forwardedRef} createWebChatInstance={createWebChatInstance} />;
    }

    const WithForwardedRef = React.forwardRef((props: OriginalProps<T>, ref: React.Ref<unknown>) => (
      <WithWebChat {...props} forwardedRef={ref} />
    ));
    WithForwardedRef.displayName = displayName;

    return WithForwardedRef;
  };
}

/**
 * A class to mirror the old jQuery deferred to allow exposing of resolve, reject to external scripts to call.
 *
 * @see https://github.com/domenic/promises-unwrapping/blob/master/docs/states-and-fates.md
 */
class Deferred<T> {
  public promise: Promise<T>;

  private fate: 'resolved' | 'unresolved';

  private state: 'pending' | 'fulfilled' | 'rejected';

  private _resolve: (value?: T | PromiseLike<T>) => void;

  private _reject: (reason?: unknown) => void;

  constructor() {
    this.state = 'pending';
    this.fate = 'unresolved';
    this.promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
    this.promise.then(
      () => {
        this.state = 'fulfilled';
      },
      () => {
        this.state = 'rejected';
      },
    );
  }

  resolve(value?: T) {
    this.fate = 'resolved';
    this._resolve(value);
  }

  reject(reason?: unknown) {
    this.fate = 'resolved';
    this._reject(reason);
  }

  isResolved() {
    return this.fate === 'resolved';
  }

  isPending() {
    return this.state === 'pending';
  }

  isFulfilled() {
    return this.state === 'fulfilled';
  }

  isRejected() {
    return this.state === 'rejected';
  }
}

// Inject WatsonAssistantChatEntry.js on the page and return a promise that resolves successfully onload.
function loadWebChatScript(webChatConfig: WebChatConfig, baseUrl: string): Promise<void> {
  const src = `${baseUrl.replace(/\/$/, '')}/versions/${
    webChatConfig.clientVersion || 'latest'
  }/WatsonAssistantChatEntry.js`;

  return loadWebChatScriptNew(src);
}

export { withWebChat };
