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
/* eslint-disable import/no-extraneous-dependencies */

import deepFreeze from 'deep-freeze';
import { render } from '@testing-library/react';

const TEST_INSTANCE_CONFIG = {
  integrationID: 'f38e21ee-d79c-4427-859c-4fdd9bbed8f1',
  region: 'us-south' as const,
  serviceInstanceID: '981593e2-2d49-41f2-81d1-1bbdfb4f7898',
  openChatByDefault: true,
};
deepFreeze(TEST_INSTANCE_CONFIG);

/**
 * Waits for an element with the given text to appear in the document.
 */
async function waitForText(text: string, findAllByText: ReturnType<typeof render>['findAllByText']) {
  await findAllByText(text, { exact: false }, { timeout: 20000 });
}

/**
 * Waits for web chat to load and the text input field to appear.
 */
async function waitForWebChat(findAllByPlaceholderText: ReturnType<typeof render>['findAllByPlaceholderText']) {
  await findAllByPlaceholderText('Type something...', { exact: false }, { timeout: 20000 });
}

export { TEST_INSTANCE_CONFIG, waitForText, waitForWebChat };
