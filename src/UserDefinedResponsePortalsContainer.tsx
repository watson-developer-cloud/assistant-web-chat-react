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

import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom';
import { UserDefinedResponseEvent } from './types/UserDefinedResponseEvent';
import { WebChatInstance } from './types/WebChatInstance';
import { RenderUserDefinedResponse } from './WebChatContainer';

interface UserDefinedResponsePortalsContainer {
  /**
   * The instance of a web chat that this component will register listeners on.
   */
  webChatInstance: WebChatInstance;

  /**
   * The function that this component will use to request the actual React content to display for each user defined
   * response.
   */
  renderResponse: RenderUserDefinedResponse;

  /**
   * The list of events that were fired that contain all the responses to render.
   */
  userDefinedResponseEvents: UserDefinedResponseEvent[];
}

/**
 * This is a utility component that is used to manage all the user defined responses that are rendered by web chat.
 * When a user defined response message is received by web chat, it will fire a "userDefinedResponse" event that
 * provides an HTML element to which your application can attach user defined content. React portals are a mechanism
 * that allows you to render a component in your React application but attach that component to the HTML element
 * that was provided by web chat.
 *
 * This component will render a portal for each user defined response. The contents of that portal will be
 * determined by calling the provided "renderResponse" render prop.
 */
function UserDefinedResponsePortalsContainer({
  webChatInstance,
  renderResponse,
  userDefinedResponseEvents,
}: UserDefinedResponsePortalsContainer) {
  // All we need to do to enable the React portals is to render each portal somewhere in your application (it
  // doesn't really matter where).
  return (
    <>
      {userDefinedResponseEvents.map(function mapEvent(event, index) {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <UserDefinedResponseComponentPortal key={index} hostElement={event.data.element}>
            {renderResponse(event, webChatInstance)}
          </UserDefinedResponseComponentPortal>
        );
      })}
    </>
  );
}

/**
 * This is the component that will attach a React portal to the given host element. The host element is the element
 * provided by web chat where your user defined response will be displayed in the DOM. This portal will attach any React
 * children passed to it under this component so you can render the response using your own React application. Those
 * children will be rendered under the given element where it lives in the DOM.
 */
function UserDefinedResponseComponentPortal({
  hostElement,
  children,
}: {
  hostElement: HTMLElement;
  children: ReactNode;
}) {
  return ReactDOM.createPortal(children, hostElement);
}

const UserDefinedResponsePortalsContainerExport = React.memo(UserDefinedResponsePortalsContainer);
export { UserDefinedResponsePortalsContainerExport as UserDefinedResponsePortalsContainer };
