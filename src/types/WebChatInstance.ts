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

export { WebChatInstance };
