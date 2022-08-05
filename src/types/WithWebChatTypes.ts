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

import React from 'react';
import { WebChatConfig } from './WebChatConfig';
import { WebChatInstance } from './WebChatInstance';

/**
 * Configuration object for withWebChat higher order component.
 */
interface WithWebChatConfig {
  /**
   * Adds logging for setup and tear down process of web chat. Helpful for seeing if your application is aggressively
   * mounting and remounting web chat.
   */
  debug?: boolean;

  /**
   * Set the url where web chat assets are hosted. Used for development purposes.
   */
  baseUrl?: string;
}

/**
 * Properties added by the withWebChat higher order component to passed components.
 */
interface AddedWithWebChatProps {
  /**
   * The method to create a web chat instance.
   *
   * @param config - A web chat configuration options object.
   * @returns A promise resolving with an instance of web chat.
   */
  createWebChatInstance: (config: WebChatConfig) => Promise<WebChatInstance>;
}

/**
 * The ref that is added to WithWebChat by forwardRef.
 */
interface ForwardedRefProps {
  forwardedRef: React.Ref<unknown>;
}

/**
 * The props passed into the original component combined with the ref props we add later.
 */
type WithWebChatProps<T> = T & ForwardedRefProps;

/**
 * Props passed to the original component with any reference to any props added by the HOC removed.
 * We need to specifically say to not have two props of the same name here for TypeScript to correctly
 * infer types.
 */
type OriginalProps<T> = Omit<T, keyof AddedWithWebChatProps>;

export { AddedWithWebChatProps, WithWebChatConfig, ForwardedRefProps, WithWebChatProps, OriginalProps };
