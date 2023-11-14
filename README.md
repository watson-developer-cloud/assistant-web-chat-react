[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build and Test](https://github.com/watson-developer-cloud/assistant-web-chat-react/actions/workflows/build-test.yml/badge.svg)](https://github.com/watson-developer-cloud/assistant-web-chat-react/actions/workflows/build-test.yml)

# IBM watsonx Assistant web chat with React

`@ibm-watson/assistant-web-chat-react` is a React library to extend the [web chat](https://cloud.ibm.com/docs/watson-assistant?topic=watson-assistant-deploy-web-chat) feature of [IBM watsonx Assistant](https://www.ibm.com/cloud/watson-assistant) within your React application. This makes it easier to provide user-defined response types written in React, add content to custom elements with React, have the web chat and your site communicate more easily, and more.

The primary utility provided by this library is the `WebChatContainer` functional component. This component will load and render an instance of web chat when it is mounted and destroy that instance when unmounted.

<details>
  <summary>Table of contents</summary>

- [Installation](#installation)
- [Using WebChatContainer](#using-webchatcontainer)
- [WebChatCustomElement](#webchatcustomelement)
- [API](#api)
- [withWebChat](#withWebChat)
- [Additional resources](#additional-resources)
- [License](#license)

</details>

## Installation

To install using `npm`:

```bash
npm install @ibm-watson/assistant-web-chat-react
```

Or using `yarn`:

```bash
yarn add @ibm-watson/assistant-web-chat-react
```

## Using WebChatContainer

### Basic example

The `WebChatContainer` function component is intended to make it as easy as possible to include web chat in your React application. To use, you simply need to render this component anywhere in your application and provide the [web chat configuration options object](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-configuration#configurationobject) as a prop.

```javascript
import React from 'react';
import { WebChatContainer, setEnableDebug } from '@ibm-watson/assistant-web-chat-react';

const webChatOptions = {
  integrationID: 'XXXX',
  region: 'XXXX',
  serviceInstanceID: 'XXXX',
  // subscriptionID: 'only on enterprise plans',
  // Note that there is no onLoad property here. The WebChatContainer component will override it.
  // Use the onBeforeRender or onAfterRender prop instead.
};

// Include this if you want to get debugging information from this library. Note this is different than
// the web chat "debug: true" configuration option which enables debugging within web chat.
setEnableDebug(true);

function App() {
  return <WebChatContainer config={webChatOptions} />;
}
```

### Accessing instance methods

You can use the `onBeforeRender` or `onAfterRender` props to get access to the instance of web chat if you need call instance methods later. This example renders a button that toggles web chat open and is only rendered after the instance has become available.

```javascript
import React, { useCallback, useState } from 'react';
import { WebChatContainer } from '@ibm-watson/assistant-web-chat-react';

const webChatOptions = { /* Web chat options */ };

function App() {
  const [instance, setInstance] = useState(null);

  const toggleWebChat = useCallback(() => {
    instance.toggleOpen();
  }, [instance]);

  return (
    <>
      {instance && (
        <button type="button" onClick={toggleWebChat}>
          Toggle web chat
        </button>
      )}
      <WebChatContainer config={webChatOptions} onBeforeRender={(instance) => onBeforeRender(instance, setInstance)} />
    </>
  );
}

function onBeforeRender(instance, setInstance) {
  // Make the instance available to the React components.
  setInstance(instance);

  // Do any other work you might want to do before rendering. If you don't need any other work here, you can just use
  // onBeforeRender={setInstance} in the component above.
}
```

### Custom responses

This component is also capable of managing custom responses. To do so, you need to pass a `renderCustomResponse` function as a prop. This function should return a React component that will render the content for the specific message for that response. You should make sure that the `WebChatContainer` component does not get unmounted in the middle of the life of your application because it will lose all custom responses that were previously received by web chat.

```javascript
import React from 'react';
import { WebChatContainer } from '@ibm-watson/assistant-web-chat-react';

const webChatOptions = { /* Web chat options */ };

function App() {
  return <WebChatContainer renderCustomResponse={renderCustomResponse} config={webChatOptions} />;
}

function renderCustomResponse(event) {
  // The event here will contain details for each custom response that needs to be rendered.
  // The "user_defined_type" property is just an example; it is not required. You can use any other property or
  // condition you want here. This makes it easier to handle different response types if you have more than
  // one custom response type.
  if (event.data.message.user_defined && event.data.message.user_defined.user_defined_type === 'my-custom-type') {
    return <div>My custom content</div>
  }
}
```

## WebChatCustomElement

This library provides the component `WebChatCustomElement` which can be used to aid in render web chat inside a custom element. This is needed if you want to be able to change the location where web chat is rendered. This component will render an element in your React app and use that element as the custom element for rendering web chat. It will also the `WebChatContainer` component to manage the life cycle of web chat so you will use `WebChatCustomElement`.

If you use this component, you will need to provide some CSS styles to control how the transition occurs between web chat showing and hiding. By default, the component will simply add a `HideWebChat` class to the web chat main window when it is closed. All you need to do is provide a `#WACContainer.WACContainer .HideWebChat { display: none }` rule in your CSS. You can also override the view change code is you need more fine-grained control over the style changes that occur. This would be useful if you wanted to animate the transitions.

The simplest example is this:

```javascript
import React from 'react';
import { WebChatCustomElement } from '@ibm-watson/assistant-web-chat-react';

import './App.css';

const webChatOptions = { /* Web chat options */ };

function App() {
  return <WebChatCustomElement className="MyCustomElement" config={webChatOptions} />;
}
```

```css
.MyCustomElement {
  position: absolute;
  left: 100px;
  top: 100px;
  width: 500px;
  height: 500px;
}

#WACContainer.WACContainer .HideWebChat {
  display: none;
}
```

## API

### WebChatContainer API

The `WebChatContainer` function is a functional component that will load and render an instance of web chat when it is mounted and destroy that instance when unmounted. If the web chat configuration options change, it will also destroy the previous web chat and create a new one with the new configuration. It can also manage React portals for custom responses.

Note that this component will call the [web chat render](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-instance-methods#render) method for you. You do not need to call it yourself. You can use the `onBeforeRender` or `onAfterRender` prop to execute operations before or after render is called.

#### Props

`WebChatContainer` has the following props.

| Attribute | Required | Type    | Description |
|-----------|----------|---------|-------------|
| config    | Yes      | object  | The [web chat configuration options object](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-configuration#configurationobject). Note that any `onLoad` property will be ignored. If this prop is changed and a new object provided, then the current web chat will  be destroyed and a new one created with the new object. |
| instanceRef    | No      | MutableRefObject  | A convenience prop that is a reference to the web chat instance. This component will set the value of this ref using the `current` property when the instance has been created. |
| onBeforeRender    | No      | function  | This is a callback function that is called after web chat has been loaded and before the `render` function is called. This function is passed a single argument which is the instance of web chat that was loaded. This function can be used to obtain a reference to the web chat instance if you want to make use of the instance methods that are available. |
| onAfterRender    | No      | function  | This is a callback function that is called after web chat has been loaded and after the `render` function is called. This function is passed a single argument which is the instance of web chat that was loaded. This function can be used to obtain a reference to the web chat instance if you want to make use of the instance methods that are available. |
| renderCustomResponse    | No      | function  | This function is a callback function that will be called by this container to render custom responses. If this prop is provided, then the container will listen for custom response events from web chat and will generate a React portal for each event. This function will be called once during component render for each custom response event. This function takes two arguments. The first is the [custom response event](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-events#customresponse) that triggered the custom response. The second is a convenience argument that is the instance of web chat. The function should return a `ReactNode` that renders the custom content for the response. |

`WebChatCustomElement` inherits all of the props from `WebChatContainer`. It also has the following additional optional props.

| Attribute | Type    | Description |
|-----------|---------|-------------|
| className    | string  | An optional classname that will be added to the custom element. |
| id    | string  | An optional id that will be added to the custom element. |
| onViewChange    | function  | An optional listener for "view:change" events. Such a listener is required when using a custom element in order to control the visibility of the web chat main window. If no callback is provided here, a default one will be used that just adds the classname "HideWebChat" when the main window is closed and removes it when the main window is opened. If you use the default, you will also need to add a "#WACContainer.WACContainer .HideWebChat { display: none }" rule to your CSS. You can provide a different callback here if you want custom behavior such as an animation when the main window is opened or closed. Note that this function can only be provided before web chat is loaded. After web chat is loaded, the event handler will not be updated. See the web chat [view:change documentation](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-events#view:change) for more information. Also see the [tutorial for using animiations with custom elements](https://github.com/watson-developer-cloud/assistant-toolkit/tree/master/integrations/webchat/examples/custom-element/client/javascript-animation) for an example of what can be done here. |

### Debugging

In addition to the props above, the `WebChatContainer` component can output additional debug information. To enable this output, call the `setEnableDebug` function which is exported from this library.

```javascript
setEnableDebug(true);

function App() {
  return <WebChatContainer config={webChatOptions} />;
}
```

## withWebChat

The [withWebChat](WITH_WEB_CHAT.MD) function is an older function that is used for loading web chat. It is now deprecated in favor of using the `WebChatContainer` component instead.

## Additional resources
- [IBM watsonx Assistant](https://www.ibm.com/cloud/watson-assistant)
- [IBM watsonx Assistant web chat feature documentation](https://cloud.ibm.com/docs/watson-assistant?topic=watson-assistant-deploy-web-chat)
- [IBM watsonx Assistant web chat API documentation](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-overview)

## License

This package is available under the [MIT License](./LICENSE).