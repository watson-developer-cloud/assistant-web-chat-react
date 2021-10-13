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

/**
 * The web chat configuration options object.
 *
 * Since any version above 5.0.0 of web chat can be loaded via `withWebChat`, this type is a minimal implementation of
 * the web chat configuration options object.
 *
 * @see https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-configuration
 */
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
   * This component allows loading multiple different versions of web chat.
   */
  [key: string]: any;
}

/**
 * The web chat instance returned by `createWebChatInstance`.
 *
 * @see https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-instance-methods
 */
interface WebChatInstance {
  /**
   * This component allows loading multiple different versions of web chat.
   */
  [key: string]: any;
}

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
   *
   * @returns A promise resolving with an instance of web chat.
   */
  createWebChatInstance: (config: WebChatConfig) => Promise<WebChatInstance>;
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

export { WebChatConfig, WebChatInstance, AddedWithWebChatProps, WithWebChatConfig };
