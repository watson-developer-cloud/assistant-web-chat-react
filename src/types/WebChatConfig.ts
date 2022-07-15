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
 * This file contains the definition for the public application configuration operations that are provided by the
 * host page.
 */

import { ServiceDesk, ServiceDeskFactoryParameters } from './ServiceDesk';
import { WebChatInstance } from './WebChatInstance';

/**
 * A string identifying what Carbon Theme we should base UI variables off of. Defaults to 'g10'. See
 * https://v10.carbondesignsystem.com/guidelines/color/usage/.
 */
// eslint-disable-next-line no-shadow
enum CarbonTheme {
  WHITE = 'white',
  G10 = 'g10',
  G90 = 'g90',
  G100 = 'g100',
}

/**
 * The different variations of the launcher that can exist in the wild. Large, small, and reveal are all covid launchers.
 */
// eslint-disable-next-line no-shadow
enum LauncherType {
  DEFAULT = 'default',
  LARGE = 'large',
  SMALL = 'small',
  REVEAL = 'reveal',

  /**
   * The launcher that expands to a "complex" variation on desktop.
   */
  DESKTOP = 'desktop',

  /**
   * The launcher that expands to an "extended" variation on mobile.
   */
  MOBILE = 'mobile',

  /**
   * The original beta launcher.
   */
  MEDIUM = 'medium',
}

/**
 * This is the config that actually appears embedded in the host web page. It's the same as the public config
 * interface above that is stored in the redux store except it has a few extra properties we remove before putting
 * the config in to redux.
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
  serviceInstanceID?: string;

  /**
   * If you have a premium account, this is ID of your subscription and it is required. If you need this, it will be
   * provided in the snippet for you to copy and paste. If you don't need this, you won't see it.
   */
  subscriptionID?: string;

  /**
   * This is an optional initial JWT identity token that can be provided up front when using security with the web
   * chat. If this value is not provided and security is enabled, an identityTokenExpired event will be fired to
   * fetch the first token.
   */
  identityToken?: string;

  /**
   * Render the chat launcher element used to open and close the chat window. If you elect to not show our built in
   * chat launcher, you will be responsible for firing the launcher:toggle, launcher:open or launcher:close events
   * from your own chat launcher. Or, you can use options.openChatByDefault to just have the chat interface be open
   * at initialization.
   */
  showLauncher?: boolean;

  /**
   * By default, the chat window will be rendered in a "closed" state.
   */
  openChatByDefault?: boolean;

  /**
   * Beta version of disclaimer screen. No tooling for this, yet, but we have several customers that want it now to move
   * away from their citizen web chat to a paid account.
   */
  disclaimer?: DisclaimerPublicConfig;

  /**
   * Hide the ability to minimize the web chat.
   */
  hideCloseButton?: boolean;

  /**
   * Indicates if the close and restart (X) button should be rendered.
   */
  showCloseAndRestartButton?: boolean;

  /**
   * This value is only used when a custom element is being used to render the widget. By default a number of
   * enhancements to the widget are activated on mobile devices which can interfere with a custom element. This
   * value can be used to disable those enhancements while using a custom element.
   */
  disableCustomElementMobileEnhancements?: boolean;

  /**
   * Add a bunch of noisy console.log messages!
   */
  debug?: boolean;

  /**
   * A string identifying what Carbon Theme we should base UI variables off of. Defaults to 'g10'. See
   * https://v10.carbondesignsystem.com/guidelines/color/usage/.
   */
  carbonTheme?: CarbonTheme;

  /**
   * If true, "x-watson-learning-opt-out" header is sent.
   */
  learningOptOut?: boolean;

  /**
   * A nonce value to set on restricted elements to allow them to satisfy a Content-Security-Policy. If a website is
   * using a Content-Security-Policy along with a nonce to whitelist which style and script elements are allowed,
   * the site can provide this nonce value here which will then be added to the dynamic script and style tags
   * generated by the widget which will allow them to run.
   */
  cspNonce?: string;

  /**
   * A string identifying the direction the web chat should render. If "rtl", then the web chat renders with
   * right-to-left styling. If a direction is provided that is not "rtl", the web chat renders with left-to-right
   * stylings. If no direction is provided and the host page direction can be determined, then the web chat will render
   * in that same direction, otherwise it renders with left-to-right stylings.
   */
  direction?: string;

  /**
   * The version of the chat widget to use. This value may specify "latest" or it may specify a partial version such
   * as "1.5" (which would cover anything that is "1.5.x". If no matching version is found, an error will be logged
   * and the latest version will be used.
   *
   * @see IBMConfig.useExactVersion is an internal-use-only flag used to disable validation of the version number so
   * it can be used as-is.
   */
  clientVersion?: string;

  /**
   * This is a factory for producing custom implementations of service desks. If this value is set, then this will
   * be used to create an instance of a {@link ServiceDesk} when the user attempts to connect to an agent.
   */
  serviceDeskFactory?: (parameters: ServiceDeskFactoryParameters) => Promise<ServiceDesk>;

  /**
   * Session ID to load history for.  This will override any value stored in the browser's session storage.
   */
  sessionID?: string;

  /**
   * Any public config to apply to service desks.
   */
  serviceDesk?: ServiceDeskPublicConfig;

  /**
   * If the web chat should grab focus if the web chat is open on page load. This applies to session history open
   * states as well as openByChatByDefault. This should be set to false if the web chat is embedded in the tooling, for instance.
   */
  shouldTakeFocusIfOpensAutomatically?: boolean;

  /**
   * An optional namespace that can be added to the web chat that must be 30 characters or under. This value is
   * intended to enable multiple instances of the web chat to be used on the same page. The namespace for this web
   * chat. This value is used to generate a value to append to anything unique (id, session keys, etc) to allow
   * multiple web chats on the same page.
   *
   * Note: this value is used in the aria region label for the web chat. This means this value will be read out loud
   * by users using a screen reader.
   */
  namespace?: string;

  /**
   * An undocumented flag to allow clients to disable session history if they need to.
   */
  disableSessionHistory?: boolean;

  /**
   * Indicates if a focus trap should be enabled when the web chat is open.
   */
  enableFocusTrap?: boolean;

  /**
   * The configuration that defines how web chat responds to link page requests (where there's a link reference in the
   * URL).
   */
  pageLinkConfig?: PageLinkConfig;

  /**
   * A configuration option used to configure how web chat communicates with the servers.
   */
  servers?: ServersConfig;

  /**
   * The callback function that is called by the loadWatsonAssistantChat script once it is loaded. This is optional
   * now to preserve backwards compatibility with earlier code snippets but will eventually be required.
   */
  onLoad?: (instance: WebChatInstance) => void;

  /**
   * This is a one-off listener for errors. This value may be provided in the initial page config as a hook for
   * customers to listen for errors. We use this instead of a normal event bus handler because this function can be
   * defined and called before the event bus has been created which allows it to be used in loadWatsonAssistantChat.
   */
  onError?: (data: OnErrorData) => void;

  /**
   * An optional element the page can use as a custom in to which to render the widget.
   */
  element?: Element;
}

/**
 * The section of the public config that contains configuration options for service desk integrations.
 */
interface ServiceDeskPublicConfig {
  /**
   * The timeout value in seconds to use when determining agent availability. When a connect_to_agent response is
   * received, the system will ask the service desk if any agents are available. If no response is received within
   * the timeout window, the system will return "false" to indicate no agents are available.
   */
  availabilityTimeoutSeconds?: number;

  /**
   * Indicates if web chat should auto-connect to an agent whenever it receives a connect_to_agent response and
   * agents are available. This essentially mimics the user clicking the "Request agent" button on the card. The
   * card is still displayed to the user.
   */
  skipConnectAgentCard?: boolean;
}

/**
 * The configuration that defines how web chat responds to link page requests (where there's a link reference in the
 * URL).
 */
interface PageLinkConfig {
  /**
   * The configuration for all of the link IDs. The keys are the link IDs and the values are the configurations
   * specific to each link ID.
   */
  linkIDs: Record<string, PageLinkIDConfig>;
}

/**
 * The link configuration for a specific link ID.
 */
interface PageLinkIDConfig {
  /**
   * The text of the utterance that will be sent to the assistant when the page is loaded and the given link ID is
   * found.
   */
  text: string;
}

/**
 * A configuration option used to configure how web chat communicates with the servers.
 */
interface ServersConfig {
  /**
   * A prefix to use when forming the URLs used to communicate with the assistant.
   */
  assistantURLPrefix?: string;
}

interface DisclaimerPublicConfig {
  /**
   * If the disclaimer is turned on in the tooling (well, someday... now its just a developer option).
   */
  isOn: boolean;

  /**
   * HTML content to show in disclaimer.
   */
  disclaimerHTML: string;
}

type OnErrorType =
  | 'INITIAL_CONFIG'
  | 'OPEN_CONFIG'
  | 'MESSAGE_COMMUNICATION'
  | 'RENDER'
  | 'IDENTITY_TOKEN'
  | 'INTEGRATION_ERROR'
  | 'AGENT_APP_EXPIRED_SESSION'
  | 'HYDRATION'
  | 'PREVIEW_LINK_SECURITY';

interface OnErrorData {
  /**
   * The type of error that occurred.
   */
  errorType: OnErrorType;

  /**
   * A message associated with the error.
   */
  message: string;

  /**
   * A possible error code associated with this error. The meaning of this value may vary based on the error type.
   */
  errorCode?: number;

  /**
   * An extra blob of data associated with the error. This may be a stack trace for thrown errors.
   */
  otherData?: unknown;

  /**
   * If the error is of the severity that requires a whole restart of web chat.
   */
  catastrophicErrorType?: unknown;
}

export {
  CarbonTheme,
  LauncherType,
  PageLinkIDConfig,
  ServiceDeskFactoryParameters,
  ServiceDeskPublicConfig,
  WebChatConfig,
};
