/**
 * (C) Copyright IBM Corp. 2021.
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

interface WebChatConfig {
  /**
   * The integration ID of your web chat integration. This is exposed as a UUID. e.g.
   * '1d7e34d5-3952-4b86-90eb-7c7232b9b540'.
   */
  integrationID: string;

  /**
   * Which data center your integration was created in. e.g. 'us-south', 'us-east', 'jp-tok' 'au-syd', 'eu-gb',
   * 'eu-de', etc.
   */
  region: 'local' | 'dev' | 'staging' | 'us-south' | 'us-east' | 'jp-tok' | 'au-syd' | 'eu-gb' | 'eu-de' | 'kr-seo';

  /**
   * The service instance ID of the Assistant hosting your web chat integration. This is exposed as a UUID. e.g.
   * '1d7e34d5-3952-4b86-90eb-7c7232b9b540'. This will eventually be made to be required.
   */
  serviceInstanceID: string;

  /**
   * If you have a premium account, this is ID of your subscription and it is required. If you need this, it will be
   * provided in the snippet for you to copy and paste. If you don't need this, you won't see it.
   */
  subscriptionID?: string;

  /**
   * The version of the chat widget to use. This value may specify "latest" or it may specify a partial version such
   * as "5.0" (which would cover anything that is "5.0.x". If no matching version is found, an error will be logged
   * and the latest version will be used.
   */
  clientVersion?: string;

  /**
   * This component allows loading multiple different versions of web chat.
   */
  [key: string]: any;
}

interface WebChatInstance {
  /**
   * This component allows loading multiple different versions of web chat.
   */
  [key: string]: any;
}

interface WithWebChatConfig {
  debug?: boolean;
  baseUrl?: string;
}

interface AddedWithWebChatProps {
  createWebChatInstance: (config: WebChatConfig) => Promise<WebChatInstance>;
}

interface WithForwardRef {
  forwardedRef?: React.Ref<unknown>;
}

declare global {
  /**
   * Optionally, adding the instance of WAC to window for use by the tutorial demos.
   */
  interface Window {
    /**
     *
     */
    loadWatsonAssistantChat?: (config: WebChatConfig) => Promise<WebChatInstance>;
  }
}

export { WebChatConfig, WebChatInstance, AddedWithWebChatProps, WithWebChatConfig, WithForwardRef };
