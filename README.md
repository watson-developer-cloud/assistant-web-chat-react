[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build and Test](https://github.com/watson-developer-cloud/assistant-web-chat-react/actions/workflows/build-test.yml/badge.svg)](https://github.com/watson-developer-cloud/assistant-web-chat-react/actions/workflows/build-test.yml)

# Watson Assistant web chat with React

`@ibm-watson/assistant-web-chat-react` is a React library to extend the [web chat](https://cloud.ibm.com/docs/watson-assistant?topic=watson-assistant-deploy-web-chat) feature of [IBM Watson Assistant](https://www.ibm.com/cloud/watson-assistant) within your React application. This makes it easier to provide user-defined response types written in React, add content to custom elements with React, have the web chat and your site communicate more easily, and more.

There are two utility functions provided by this library:

1. The `WebChatContainer` function is a functional component that makes use of `withWebChat` to load web chat when the component is mounted.
2. The `withWebChat` function creates a high-order-component (HOC) that you can wrap around an existing component to inject `createWebChatInstance` into it so your component can create a new instance of web chat when appropriate. You can find more information in the [withWebChat documentation](./WITH_WEB_CHAT.md).

<details>
  <summary>Table of contents</summary>

- [Installation](#installation)
- [Using WebChatContainer](#webchatcontainer)
- [API](#api)
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

The `WebChatContainer` function component is intended to make it as easy as possible to include web chat in your React application. To use, you simply need to render this component anywhere in your application and provide the [web chat configuration options object](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-configuration#configurationobject) as a prop.

```javascript
function App() {
  const webChatOptions = {
    integrationID: 'XXXX',
    region: 'XXXX',
    serviceInstanceID: 'XXXX',
    // subscriptionID: 'only on enterprise plans',
    // Note that there is no onLoad property here. The WebChatContainer component will override it with its own.
  };
  return <WebChatContainer config={webChatOptions} />;
}
```

This component is also capable of managing custom responses. To do so, you need to pass a `renderCustomResponse` function as a prop. This function should return a React component that will render the content for the specific message for that response. You should make sure that the `WebChatContainer` component does not get unmounted in the middle of the life of your application because it will lose all custom responses that were previously received by web chat.

```javascript
function App() {
  const webChatOptions = {
    integrationID: 'XXXX',
    region: 'XXXX',
    serviceInstanceID: 'XXXX',
    // subscriptionID: 'only on enterprise plans',
    // Note that there is no onLoad property here. The WebChatContainer component will override it with its own.
  };
  return <WebChatContainer renderCustomResponse={renderCustomResponse} config={webChatOptions} />;
}

function renderCustomResponse(event) {
  return <div>My custom content</div>;
}
```

## API

### WebChatContainer API

The `WebChatContainer` function is a functional component that makes use of `withWebChat` to load web chat when the component is mounted. It can also manage React portals for custom responses.

#### Props

`WebChatContainer` has the following props.

| Attribute | Required | Type    | Description |
|-----------|----------|---------|-------------|
| config    | Yes      | object  | The [web chat configuration options object](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-configuration#configurationobject). Note that any `onLoad` property will be ignored. |
|
| instanceRef    | No      | MutableRefObject  | A convenience prop that is a reference to the web chat instance. This component will set the value of this ref using the `current` property when the instance has been created. |
|
| onBeforeRender    | No      | function  | This is a callback function that is called after web chat has been loaded and before the `render` function is called. This function is passed a single argument which is the instance of web chat that was loaded. This function can be used to obtain a reference to the web chat instance if you want to make use of the instance functions that are available. |
|
| renderCustomResponse    | No      | function  | This function is a callback function that will be called by this container to render custom responses. If this prop is provided, then the container will listen for custom response events from web chat and will generate a React portal for each event. This function will be called once during component render for each custom response event. This function takes two arguments. The first is the [custom response event](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-events#customresponse) that triggered the custom response. The second is a convenience argument that is the instance of web chat. The function should return a `ReactNode` that renders the custom content for the response. |
|

## Additional resources
- [Watson Assistant](https://www.ibm.com/cloud/watson-assistant)
- [Watson Assistant web chat feature documentation](https://cloud.ibm.com/docs/watson-assistant?topic=watson-assistant-deploy-web-chat)
- [Watson Assistant web chat API documentation](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-overview)
- [Higher order components](https://reactjs.org/docs/higher-order-components.html)

## License

This package is available under the [MIT License](./LICENSE).