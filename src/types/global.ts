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

import { WebChatConfig } from './WebChatConfig';
import { WebChatInstance } from './WebChatInstance';

declare global {
  interface Window {
    /**
     * This is the initialization function that the web chat script adds to the window object that can be used to
     * load web chat.
     */
    loadWatsonAssistantChat?: (config: WebChatConfig) => Promise<WebChatInstance>;
  }
}
