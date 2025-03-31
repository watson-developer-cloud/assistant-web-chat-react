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

/**
 * This is the web chat config that is provided by the host page that is passed to web chat (usually through
 * window.watsonAssistantChatOptions. The actual values available here can vary depending on the version of web chat
 * being used. You can find the official documentation for these config options here:
 * https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-configuration.
 */
interface WebChatConfig {
  /**
   * The integration ID of your web chat integration. This is exposed as a UUID.
   */
  integrationID: string;

  /**
   * Which data center your integration was created in. e.g. 'us-south', 'us-east', 'jp-tok' 'au-syd', 'eu-gb',
   * 'eu-de', etc.
   */
  region: string;

  /**
   * The service instance ID of the Assistant hosting your web chat integration.
   */
  serviceInstanceID?: string;

  /**
   * If you have a premium account, this is ID of your subscription and it is required. If you need this, it will be
   * provided in the snippet for you to copy and paste. If you don't need this, you won't see it.
   */
  subscriptionID?: string;

  /**
   * This library allows loading multiple different versions of web chat.
   */
  [key: string]: any;
}

export { WebChatConfig };
