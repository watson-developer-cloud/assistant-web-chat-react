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

import React, { ReactNode, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { CustomResponseEvent } from './types/CustomResponseEvent';
import { WebChatInstance } from './types/WebChatInstance';

interface CustomResponsePortalsContainer {
  /**
   * The instance of a web chat that this component will register listeners on.
   */
  webChatInstance: WebChatInstance;

  /**
   * The function that this component will use to request the actual React content to display for each custom
   * response.
   */
  renderResponse: (event: CustomResponseEvent, instance: WebChatInstance) => ReactNode;
}

/**
 * This is a utility component that is used to manage all the custom responses that are rendered by web chat. When a
 * custom response message is received by web chat, it will fire a "customResponse" event that provides an HTML element
 * to which your application can attach custom content. React portals are a mechanism that allows you to render a
 * component in your React application but attach that component to the HTML element that was provided by web chat.
 *
 * When this component is mounted, it will register a listener for the "customResponse" event from web chat. It will
 * save each event in a list and then render a portal for each event. Each portal will be attached to the element that
 * was created by web chat and is where that custom response should be attached.
 *
 * To use this component, all you need to do is mount is somewhere in your application; it doesn't really matter
 * where but you should make sure that the component does not get unmounted because it will lose all the custom
 * responses that had been received prior to that point.
 */
function CustomResponsePortalsContainer({ webChatInstance, renderResponse }: CustomResponsePortalsContainer) {
  // This state will be used to record all of the custom response events that are fired from the widget. These
  // events contain the HTML elements that we will attach our portals to as well as the messages that we wish to
  // render in the message.
  const [customResponseEvents, setCustomResponseEvents] = useState<CustomResponseEvent[]>([]);

  // When the component is mounted, register the custom response handler that will store the references to the custom
  // response events.
  useEffect(() => {
    // This handler will fire each time a custom response occurs and we will update our state by appending the event
    // to the end of our events list. We have to make sure to create a new array in order to trigger a re-render.
    function customResponseHandler(event: CustomResponseEvent) {
      setCustomResponseEvents((eventsArray) => eventsArray.concat(event));
    }

    webChatInstance.on({ type: 'customResponse', handler: customResponseHandler });

    // Remove the custom response handler.
    return () => {
      webChatInstance.off({ type: 'customResponse', handler: customResponseHandler });
    };
  }, [webChatInstance]);

  // All we need to do to enable the React portals is to render each portal somewhere in your application (it
  // doesn't really matter where).
  return (
    <>
      {customResponseEvents.map(function mapEvent(event, index) {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <CustomResponseComponentPortal key={index} hostElement={event.data.element}>
            {renderResponse(event, webChatInstance)}
          </CustomResponseComponentPortal>
        );
      })}
    </>
  );
}

/**
 * This is the component that will attach a React portal to the given host element. The host element is the element
 * provided by web chat where your custom response will be displayed in the DOM. This portal will attach any React
 * children passed to it under this component so you can render the response using your own React application. Those
 * children will be rendered under the given element where it lives in the DOM.
 */
function CustomResponseComponentPortal({ hostElement, children }: { hostElement: HTMLElement; children: ReactNode }) {
  return ReactDOM.createPortal(children, hostElement);
}

const CustomResponsePortalsContainerExport = React.memo(CustomResponsePortalsContainer);
export { CustomResponsePortalsContainerExport as CustomResponsePortalsContainer };
