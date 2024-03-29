/* eslint-disable @typescript-eslint/no-empty-function */
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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const nodeCrypto = require('crypto');

// Hide all the internal output from test cases.
console.error = () => {};
console.warn = () => {};
console.log = () => {};
console.debug = () => {};
console.info = () => {};

// eslint-disable-next-line no-undef
window.crypto = {
  getRandomValues(buffer) {
    return nodeCrypto.randomFillSync(buffer);
  },
};
