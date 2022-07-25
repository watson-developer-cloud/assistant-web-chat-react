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
 * Additional options that may be passed to the service desk when a chat is started.
 */
interface StartChatOptions {
  /**
   * Some arbitrary payload of data that was provided as part of the "agent:pre:startChat" event.
   */
  preStartChatPayload: unknown;
}

/**
 * Additional info that may be provided when a chat is ended.
 */
interface EndChatInfo<TPayloadType = unknown> {
  /**
   * Before a chat is ended, a agent:pre:chat is fired. The payload value assigned to this event by a listener is
   * provided here.
   */
  preEndChatPayload: TPayloadType;
}

/**
 * This is the public interface for a human agent service desk integration. This is the interface between the chat
 * widget and the implementation of the human agent interface with one of the various supported service desks.
 */
interface ServiceDesk {
  /**
   * Instructs the service desk to start a new chat. This will be called when a user requests to connect to an agent
   * and web chat initiates the process (typically when the user clicks the button on the "Connect to Agent" card).
   * It will make the appropriate calls to the service desk to start the chat and will make use of the callback to
   * inform web chat when an agent joins or messages are received.
   *
   * This may be called multiple times by web chat. If a user begins a chat with an agent, ends the chat and then
   * begins a new chat with an agent, this function will be called again.
   *
   * If the integration is unable to start a chat (such as if the service desk is down or no agents are available)
   * then this function should throw an error to let web chat know that the chat could not be started.
   *
   * The {@link areAnyAgentsOnline} function is called before this function is called and is called as soon as a
   * "connect_to_agent" message has been received from the assistant. This determines if the "Connect to Agent" card
   * should be displayed to the user or if the "no agents are available" message configured in the skill should be
   * shown instead.
   *
   * @param connectMessage The original server message response that caused the connection to an agent. It will
   * contain specific information to send to the service desk as part of the connection. This can includes things
   * like a message to display to a human agent.
   * @param startChatOptions Additional configuration for startChat.
   * @returns Returns a Promise that resolves when the service desk has successfully started a new chat. This does
   * not necessarily mean that an agent has joined the conversation or has read any messages sent by the user.
   */
  startChat(connectMessage: any, startChatOptions: StartChatOptions): Promise<void>;

  /**
   * Tells the service desk to terminate the chat.
   *
   * @param info Additional info that may be provided as part of ending the chat.
   * @returns Returns a Promise that resolves when the service desk has successfully handled the call.
   */
  endChat(info: EndChatInfo): Promise<void>;

  /**
   * Sends a message to the agent in the service desk.
   *
   * @param message The message from the user.
   * @param messageID The unique ID of the message assigned by the widget.
   * @returns Returns a Promise that resolves when the service desk has successfully handled the call.
   */
  sendMessageToAgent(message: any, messageID: string): Promise<void>;

  /**
   * Informs the service desk of a change in the state of the web chat that is relevant to the service desks. These
   * values may change at any time.
   */
  updateState?(state: ServiceDeskStateFromWAC): void;

  /**
   * Tells the service desk if a user has started or stopped typing.
   *
   * This functionality is not currently implemented in the web chat widget.
   *
   * @param isTyping If true, indicates that the user is typing. False indicates the user has stopped typing.
   * @returns Returns a Promise that resolves when the service desk has successfully handled the call.
   * @since 5.1.1
   */
  userTyping?(isTyping: boolean): Promise<void>;

  /**
   * Informs the service desk that the user has read all the messages that have been sent by the service desk.
   *
   * This functionality is not currently implemented in the web chat widget.
   *
   * @returns Returns a Promise that resolves when the service desk has successfully handled the call.
   */
  userReadMessages?(): Promise<void>;

  /**
   * Checks if any agents are online and can connect to a user when they become available. This does not necessarily
   * mean that an agent is immediately available; when a chat is started, the user may still have to wait for an
   * agent to become available. The callback function {@link ServiceDeskCallback.updateAgentAvailability} is used to
   * give the user more up-to-date information while they are waiting for an agent to become available.
   *
   * @param connectMessage The message that contains the transfer_info object that may be used by the service desk
   * so it can perform a more specific check.
   * @returns True if some agents are available or false if no agents are available. This may also return null which
   * means the availability status of agents is unknown or the service desk doesn't support this information.
   */
  areAnyAgentsOnline?(connectMessage: any): Promise<boolean | null>;
}

/**
 * Any code that's using a service desk must implement this interface to provide this callback functions that the
 * service desk can use to send information back to the calling code when the information becomes available.
 */
interface ServiceDeskCallback {
  /**
   * Sends updated availability information to the chat widget for a user who is waiting to be connected to an
   * agent (e.g. the user is number 2 in line). This may be called at any point while waiting for the connection to
   * provide newer information.
   *
   * Note: Of the fields in the AgentAvailability object, only one of position_in_queue and estimated_wait_time can be
   * rendered in the widget. If both fields are provided, estimated_wait_time will take priority and the
   * position_in_queue field will be ignored.
   *
   * @param availability The availability information to display to the user.
   */
  updateAgentAvailability(availability: AgentAvailability): Promise<void>;

  /**
   * Informs the chat widget that an agent has joined the chat.
   */
  agentJoined(profile: AgentProfile): Promise<void>;

  /**
   * Informs the chat widget that the agent has read all the messages that have been sent to the service desk.
   */
  agentReadMessages(): Promise<void>;

  /**
   * Tells the chat widget if an agent has started or stopped typing.
   *
   * @param isTyping If true, indicates that the agent is typing. False indicates the agent has stopped typing.
   */
  agentTyping(isTyping: boolean): Promise<void>;

  /**
   * Sends a message to the chat widget from an agent. To display an error message to user, specify response_type:
   * 'inline_error' in MessageResponse, this also displays an error icon as well as hides the agent's avatar from user.
   *
   * @param message The message to display to the user.
   * @param agentID The ID of the agent who is sending the message.
   */
  sendMessageToUser(message: any, agentID: string): Promise<void>;

  /**
   * Informs the chat widget that a transfer to another agent is in progress. The agent profile information is
   * optional if the service desk doesn't have the information available. This message simply tells the chat widget
   * that the transfer has started. The service desk should inform the widget when the transfer is complete by
   * sending a {@link agentJoined} message later.
   */
  beginTransferToAnotherAgent(profile?: AgentProfile): Promise<void>;

  /**
   * Informs the chat widget that the agent has left the conversation. This does not end the conversation itself,
   * rather the only action that occurs is the visitor receives the agent left status message. If the user sends
   * another message, it is up to the service desk to decide what to do with it.
   */
  agentLeftChat(): Promise<void>;

  /**
   * Informs the chat widget that the agent has ended the conversation.
   */
  agentEndedChat(): Promise<void>;

  /**
   * Sets the state of the given error type.
   *
   * @param errorInfo Details for the error whose state is being set.
   */
  setErrorStatus(errorInfo: ServiceDeskErrorInfo): Promise<void>;
}

/**
 * The parameters that are passed to a service desk factory.
 */
interface ServiceDeskFactoryParameters {
  /**
   * The callback used by the service desk to communicate with the widget.
   */
  callback: ServiceDeskCallback;
}

/**
 * The type for the information passed to {@link ServiceDeskCallback#setErrorStatus}. It is a discriminating union
 * where the {@link #type} property is the discriminating value that determines which child interface is to be used.
 */
type ServiceDeskErrorInfo = ConnectingErrorInfo | DisconnectedErrorInfo;

/**
 * This is the parent interface for the information passed to {@link ServiceDeskCallback#setErrorStatus}. It is used
 * as a discriminating union where the {@link #type} property is the discriminating value that determines which
 * child interface is to be used.
 */
interface BaseErrorInfo {
  /**
   * An optional value that will be logged to the console as an error.
   */
  logInfo?: unknown;
}

/**
 * The interface used for connecting errors.
 */
interface ConnectingErrorInfo extends BaseErrorInfo {
  /**
   * The discriminating value for this type.
   */
  type: 1;
}

/**
 * This interface is used when the service desk in the chat client becomes disconnected from the remote service desk.
 */
interface DisconnectedErrorInfo extends BaseErrorInfo {
  /**
   * The discriminating value for this type.
   */
  type: 2;

  /**
   * Indicates if the service desk has become disconnected. A value of true can be passed that will indicate that a
   * previous disconnection is over and the service desk is now connected again.
   */
  isDisconnected: boolean;
}

/**
 * This interface represents the pieces of web chat state that can be provided to the service desks. Any of these
 * bits of state may be updated at any time and the service desks need to be prepared to handle the changes to these
 * values.
 */
interface ServiceDeskStateFromWAC {
  /**
   * The current session ID. This may change at any point if the user's session times out and a new session is created.
   */
  sessionID: string;

  /**
   * The ID of the current user. This can be changed when a user becomes authenticated.
   */
  userID: string;

  /**
   * The current locale.
   */
  locale: string;
}

/**
 * An event that captures the availability time a user has to wait.
 */
interface AgentAvailability {
  position_in_queue?: number;
  estimated_wait_time?: number;
}

/**
 * Profile information about a specific agent that can be used to display information to the user.
 */
interface AgentProfile {
  /**
   * A unique identifier for this agent.
   */
  id: string;

  /**
   * The visible name for the agent. Can be the full name or just a first name.
   */
  nickname: string;

  /**
   * A url pointing to an avatar for the agent. JPG, GIF, etc accepted. Minimum size of 64px x 64px.
   */
  profile_picture_url?: string;
}

export {
  AgentProfile,
  StartChatOptions,
  EndChatInfo,
  ServiceDeskErrorInfo,
  ServiceDesk,
  ServiceDeskCallback,
  ServiceDeskFactoryParameters,
};
