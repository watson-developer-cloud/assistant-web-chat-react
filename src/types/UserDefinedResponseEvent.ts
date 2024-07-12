/**
 * (C) Copyright IBM Corp. 2022, 2024.
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
 * This represents an event that is fired when web chat receives a user defined response (response_type =
 * "user_defined").
 */
interface UserDefinedResponseEvent {
  /**
   * The type of the event.
   */
  type: 'userDefinedResponse';

  data: {
    /**
     * The item within the MessageResponse.output.generic array that this user defined response is for.
     */
    message: unknown;

    /**
     * The full MessageResponse that this user defined response is fired for. A MessageResponse may contain multiple
     * items and an event will be fired for each.
     */
    fullMessage: unknown;

    /**
     * The host element that web chat has created where your custom content should be attached.
     */
    element?: HTMLElement;
  };
}

export { UserDefinedResponseEvent };
