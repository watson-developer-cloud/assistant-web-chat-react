[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Watson Assistant web chat with React

`@watson-conversation/watson-assistant-web-chat-react` is a React library to extend the [web chat](https://cloud.ibm.com/docs/watson-assistant?topic=watson-assistant-deploy-web-chat) feature of [Watson Assistant](https://www.ibm.com/cloud/watson-assistant) within your React application. This makes it easier to provide `user_defined` response types written in React, add content to `customElements` with React, have the web chat and your site communicate more easily, and more.

<details>
  <summary>Table of contents</summary>

- [Installation](#installation)
- [Usage](#usage)
  - [About higher order components](#about-higher-order-components)
  - [With a functional component](#with-a-functional-component)
  - [With a class component](#with-a-class-component)
  - [Render user_defined responses](#render-user_defined-responses)
  - [Render customElements](#render-custom-elements)
  - [Using with Carbon](#using-with-carbon)
  - [Using with TypeScript](#using-with-typescript)
  - [Writing tests](#writing-tests)
- [API](#api)
  - [withWebChat](#withwebchat)
  - [createWebChatInstance](#createwebchatinstance)
- [Additional resources](#additional-resources)
- [License](#license)

</details>

## Installation

To install via `npm`:

```bash
npm install @watson-conversation/watson-assistant-web-chat-react
```

Or via `yarn`:

```bash
yarn add @watson-conversation/watson-assistant-web-chat-react
```
## Usage

### About higher order components

Higher order components (HOC) are a pattern in React to allow a function to take a component as an argument, and return a new component that wraps the passed component and passes it new props. The HOC in this package will pass a prop named `createWebChatInstance`. The `createWebChatInstance` method will take a [web chat configuration options object](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-configuration#configurationobject) as an argument and will return an [instance](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-instance-methods) of web chat that you can now access inside your React application. Your created instance will automatically be destroyed if your React component unmounts.

### With a functional component

With a functional component, we can use the `useEffect` React hook to call the `createWebChatInstance` method provided as a prop.

```javascript
import React, { useEffect } from 'react';
import { withWebChat } from '@watson-conversation/watson-assistant-web-chat-react';

const MyLocation = ({ location, createWebChatInstance }) => {

    // A web chat configuration options object as documented at https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-configuration#configurationobject
    const webChatOptions = {
      integrationID: 'XXXX',
      region: 'XXXX',
      serviceInstanceID: 'XXXX',
      onLoad: onWebChatLoad
    };

    useEffect(() => {
      createWebChatInstance(webChatOptions);
    }, []);

    function onWebChatLoad(instance) {
      instance.render();
    }

    return <div>I am here in {location}!</div>;
  };

// Wrap the component with the method returned by `withWebChat`.
export default withWebChat()(MyLocation);
```

You can now use the `MyLocation` component like you would any other. You can pass through any props you want, and `withWebChat` will add `createWebChatInstance` to the props.

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

With a class based component, we will use `componentDidMount` to call the `createWebChatInstance` method provided as a prop.

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
    createWebChatInstance(webChatOptions).then(instance => { this.onWebChatLoad(instance); });
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
### Using with TypeScript

The `withWebChat` package is written with TypeScript and includes types.
In addition to exporting `withWebChat` from `@watson-conversation/watson-assistant-web-chat-react` we export the following types:

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
} from '@watson-conversation/watson-assistant-web-chat-react';

interface MyLocationProps extends AddedWithWebChatProps {
  location: string;
}

const withWebChatConfig: WithWebChatConfig = {
  debug: true
};

const MyLocation = ({ location, createWebChatInstance }: MyLocationProps) => {

    // A web chat configuration options object as documented at https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-configuration#configurationobject
    const webChatOptions: WebChatConfig = {
      integrationID: 'XXXX',
      region: 'XXXX',
      serviceInstanceID: 'XXXX',
      onLoad: onWebChatLoad
    };

    useEffect(() => {
      createWebChatInstance(webChatOptions);
    }, []);

    function onWebChatLoad(instance: WebChatInstance) {
      instance.render();
    }

    return <div>I am here in {location}!</div>;
  };

// Wrap the component with the method returned by `withWebChat`.
export default withWebChat(withWebChatConfig)(MyLocation);

```

### Writing tests

It is recommended that you mock `createWebChatInstance` in your unit tests and not test the higher order component. If you must include the higher order component in your unit test, you may have to add some extra configuration to your unit test framework to account for the fact that web chat appends additional scripts to your web site.

For instance when using the [Jest testing framework](https://jestjs.io) you must add the following configuration to your `jest.config.js` file.

```javascript
module.exports = {
  testEnvironmentOptions: {
    resources: 'usable',
    runScripts: 'dangerously',
  },
};
```

## API

### withWebChat

The `withWebChat` is a higher order function that returns a higher order component. It takes an optional configuration argument and returns a function that takes a component as an argument. This component will have `createWebChatInstance` injected as a prop.

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

This syntax allows you to chain multiple higher order components together. [See the higher order components documentation](https://reactjs.org/docs/higher-order-components.html) from the React team for more information on how higher order components work and can be composed together.

#### withWebChat options object

The `withWebChat` method takes an optional object as an argument. Most uses will never use these.

| Attribute | Required | Default                                                  | Type    | Description                                                                                                                                                        |
|-----------|----------|----------------------------------------------------------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| debug     | No       | false                                                    | boolean | If set to true, adds logging for setup and tear down process of web chat. Helpful for seeing if your application is aggressively mounting and remounting web chat. |
| baseUrl   | No       | https://web-chat.global.assistant.watson.appdomain.cloud | string  | Where externally loaded script for web chat are hosted. Used for internal development purposes.                                                                    |

### createWebChatInstance

The `createWebChatInstance` method takes a [web chat configuration options object](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-configuration#configurationobject) as an argument and returns a promise. A promise will successfully resolve with the `instance` of web chat, or catch with a descriptive error.

```javascript
createWebChatInstance(config).then(instance => {}).catch(error => {});
```
## Additional resources
- [Watson Assistant](https://www.ibm.com/cloud/watson-assistant)
- [Watson Assistant web chat feature documentation](https://cloud.ibm.com/docs/watson-assistant?topic=watson-assistant-deploy-web-chat)
- [Watson Assistant web chat API documentation](https://web-chat.global.assistant.watson.cloud.ibm.com/docs.html?to=api-overview)
- [Higher order components](https://reactjs.org/docs/higher-order-components.html)
## License

This package is available under the [MIT Licence](./LICENCE).