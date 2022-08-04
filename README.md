[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build and Test](https://github.com/watson-developer-cloud/assistant-web-chat-react/actions/workflows/build-test.yml/badge.svg)](https://github.com/watson-developer-cloud/assistant-web-chat-react/actions/workflows/build-test.yml)

# Watson Assistant web chat with React

`@ibm-watson/assistant-web-chat-react` is a React library to extend the [web chat](https://cloud.ibm.com/docs/watson-assistant?topic=watson-assistant-deploy-web-chat) feature of [IBM Watson Assistant](https://www.ibm.com/cloud/watson-assistant) within your React application. This makes it easier to provide user-defined response types written in React, add content to custom elements with React, have the web chat and your site communicate more easily, and more.

There are three utility functions provided by this library:

1. The `WebChatContainer` function is a functional component that makes use of `withWebChat` to load web chat when the component is mounted.
2. The `withWebChat` function creates a high-order-component (HOC) that you can wrap around an existing component to inject `createWebChatInstance` into it so your component can create a new instance of web chat when appropriate.
3. The `CustomResponsePortalsContainer` function is a functional component that automatically listens for custom response events from web chat and creates a React portal for each. You can render your custom component in each portal to create the rendering for the custom response. The component is used by `WebChatContainer`. 

<details>
  <summary>Table of contents</summary>

- [Installation](#installation)
- [How this works](#how-this-works)
- [Using WebChatContainer](#WebChatContainer)
- [Using withWebChat](#withWebChat)
  - [With a functional component](#with-a-functional-component)
  - [With a class component](#with-a-class-component)
  - [Render user_defined responses](#render-user_defined-responses)
  - [Render customElements](#render-custom-elements)
  - [Using with TypeScript](#using-with-typescript)
  - [Writing tests](#writing-tests)
- [API](#api)
  - [withWebChat](#withwebchat)
  - [createWebChatInstance](#createwebchatinstance)
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

## Using withWebChat

This HOC allows you to inject a property called `createWebChatInstance` as a prop to a given React component.  The `createWebChatInstance` method takes a [web chat configuration options object](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-configuration#configurationobject) as an argument and returns an [instance](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-instance-methods) of the web chat that you can now access inside your React application. Making the `instance` available for use inside your React component makes it easy for your React application and web chat to work in harmony, including allowing you to render React content inside web chat via [React portals](https://reactjs.org/docs/portals.html). Once you have an `instance` you can pass it into child components as a property or via context. You should not call `createWebChatInstance` again to access the `instance`, as it will create a *new* instance if you do so.

### With a functional component

With a functional component, you can use the `useEffect` React hook to call the `createWebChatInstance` method provided as a prop.

```javascript
import React, { useEffect } from 'react';
import { withWebChat } from '@ibm-watson/assistant-web-chat-react';

const MyLocation = ({ location, createWebChatInstance }) => {

  useEffect(() => {
    function onWebChatLoad(instance) {
      instance.render();
    }

    // A web chat configuration options object as documented at https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-configuration#configurationobject
    const webChatOptions = {
      integrationID: 'XXXX',
      region: 'XXXX',
      serviceInstanceID: 'XXXX',
      onLoad: onWebChatLoad
    };

    createWebChatInstance(webChatOptions);
  }, []);

  return <div>I am here in {location}!</div>;
};

// Wrap the component with the method returned by `withWebChat`.
export default withWebChat()(MyLocation);
```

You can now use the `MyLocation` component like you would any other. You can pass through any props you want, and `withWebChat` adds `createWebChatInstance` to the props.

```javascript
import React from 'react';
import MyLocation from './MyLocation';

// Notice we only pass in the "location" prop to the MyLocation component... "createWebChatInstance" is automatically added!
const App = () => {
  return (
    <div>
      <div>Where are you located?</div>
      <MyLocation location="Boston" />
    </div>
  );
}
```

### With a class component

With a class-based component, you can use `componentDidMount` to call the `createWebChatInstance` method provided as a prop.

```javascript
import React, { Component } from 'react';

class MyLocation extends Component {

  // A web chat configuration options object as documented at https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-configuration#configurationobject
  webChatOptions = {
    integrationID: 'XXXX',
    region: 'XXXX',
    serviceInstanceID: 'XXXX',
    onLoad: this.onWebChatLoad
  };

  componentDidMount() {
    const { createWebChatInstance } = this.props;
    createWebChatInstance(this.webChatOptions).then(instance => { this.onWebChatLoad(instance); });
  }

  onWebChatLoad = (instance) => {
    instance.render();
  };

  render() {
    const { location } = this.props;
    return <div>I am here in {location}!</div>;
  }
}

export default withWebChat()(MyLocation);
```

You can now use the `MyLocation` component like you would any other. You can pass through any props you want, and `withWebChat` will add `createWebChatInstance` to the props.

```javascript
import React, { Component } from 'react';
import MyLocation from './MyLocation';

// Notice we only pass in the "location" prop to the MyLocation component... "createWebChatInstance" is automatically added!
class App extends Component {
  render() {
    return (
      <div>
        <div>Where are you located?</div>
        <MyLocation location="Boston" />
      </div>
    );
  }
}
```
### Writing tests

It is recommended that you mock `createWebChatInstance` in your unit tests and not test the higher-order component. If you must include the higher-order component in your unit test, you might have to add some extra configuration to your unit test framework to account for the fact that web chat appends additional scripts to your web site.

For example, when using the [Jest testing framework](https://jestjs.io), you must add the following configuration to your `jest.config.js` file.

```javascript
module.exports = {
  testEnvironmentOptions: {
    resources: 'usable',
    runScripts: 'dangerously',
  },
};
```

## Using with TypeScript

This library is written in TypeScript and includes types.
In addition to `withWebChat`, this package exports the following types:

| Type                  | Description                                                                          |
|-----------------------|--------------------------------------------------------------------------------------|
| AddedWithWebChatProps | The props that the withWebChat component adds to the component that is passed to it. |
| WebChatConfig         | The configuration options object to create a new web chat instance.                  |
| WebChatInstance       | The created instance of web chat.                                                    |
| WithWebChatConfig     | The optional configuration object for withWebChat                                    |

```typescript
import React, { useEffect } from 'react';
import { 
  withWebChat,
  AddedWithWebChatProps,
  WebChatConfig,
  WebChatInstance,
  WithWebChatConfig
} from '@ibm-watson/assistant-web-chat-react';

interface MyLocationProps extends AddedWithWebChatProps {
  location: string;
}

const withWebChatConfig: WithWebChatConfig = {
  debug: true
};

const MyLocation = ({ location, createWebChatInstance }: MyLocationProps) => {
  useEffect(() => {

    function onWebChatLoad(instance: WebChatInstance) {
      instance.render();
    }

    // A web chat configuration options object as documented at https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-configuration#configurationobject
    const webChatOptions: WebChatConfig = {
      integrationID: 'XXXX',
      region: 'XXXX',
      serviceInstanceID: 'XXXX',
      onLoad: onWebChatLoad
    };

    createWebChatInstance(webChatOptions);
  }, []);

  return <div>I am here in {location}!</div>;
};

// Wrap the component with the method returned by `withWebChat`.
export default withWebChat(withWebChatConfig)(MyLocation);

```

## API

### WebChatContainer

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
### withWebChat

The `withWebChat` method is a higher-order function that returns a higher-order component. It takes an optional configuration argument and returns a function that takes a component as an argument. This component will have `createWebChatInstance` injected as a prop.

```javascript
// enchance is the higher order component.
const enhance = withWebChat(options);

// enhance takes the component as an argument and adds createWebChatInstance as a prop.
export default enhance(Component)
```

or in short form:

```javascript
export default withWebChat(options)(Component)
```

This syntax enables you to chain multiple higher-order components together. [See the higher-order components documentation](https://reactjs.org/docs/higher-order-components.html) from the React team for more information about how higher-order components work and how they can be composed together.

#### withWebChat options object

The `withWebChat` method takes an optional object as an argument. Most uses will never use these.

| Attribute | Required | Default                                                  | Type    | Description                                                                                                                                                        |
|-----------|----------|----------------------------------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| debug     | No       | false                                                    | boolean | If set to true, adds logging for setup and tear down process of web chat. Helpful for seeing if your application is aggressively mounting and remounting web chat. |
| baseUrl   | No       | https://web-chat.global.assistant.watson.appdomain.cloud | string  | Where externally loaded script for web chat are hosted. Used for internal development purposes.                                                                    |

### createWebChatInstance

The `createWebChatInstance` method takes a [web chat configuration options object](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-configuration#configurationobject) as an argument and returns a promise. This promise either will successfully resolve with the instance of the web chat, or will throw a descriptive error.

```javascript
createWebChatInstance(config).then(instance => {}).catch(error => {});
```
## Additional resources
- [Watson Assistant](https://www.ibm.com/cloud/watson-assistant)
- [Watson Assistant web chat feature documentation](https://cloud.ibm.com/docs/watson-assistant?topic=watson-assistant-deploy-web-chat)
- [Watson Assistant web chat API documentation](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-overview)
- [Higher order components](https://reactjs.org/docs/higher-order-components.html)
## License

This package is available under the [MIT License](./LICENSE).