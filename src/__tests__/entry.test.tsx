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

/* eslint-disable max-classes-per-file */

import '@testing-library/jest-dom';
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';

import { withWebChat, AddedWithWebChatProps, WebChatInstance } from '../entry';
import { WebChatConfig } from '../types';

jest.setTimeout(20000);

interface ComponentToWrapProps extends AddedWithWebChatProps {
  location: string;
}

describe('entry.tsx', () => {
  it('should load web chat via createWebChatInstance prop and pass through original props with a functional component', async () => {
    const ComponentToWrap = (props: ComponentToWrapProps) => {
      const { location, createWebChatInstance } = props;
      React.useEffect(() => {
        createWebChatInstance({
          integrationID: 'f38e21ee-d79c-4427-859c-4fdd9bbed8f1',
          region: 'us-south',
          serviceInstanceID: '981593e2-2d49-41f2-81d1-1bbdfb4f7898',
          openChatByDefault: true,
          onLoad: (instance: WebChatInstance) => {
            instance.render();
          },
        });
      }, []);
      return <div>I am here in {location}!</div>;
    };
    const WasWrappedComponent = withWebChat({ debug: true })(ComponentToWrap);
    const { getByText, getAllByText } = render(<WasWrappedComponent location="Boston" />);
    // Extra props are correctly passed.
    expect(getByText('Boston', { exact: false })).toBeInTheDocument();
    await waitFor(
      () => {
        expect(getAllByText('Watson Assistant', { exact: false }).length).toBeTruthy();
      },
      { timeout: 10000 },
    );
  });

  it('should load web chat via createWebChatInstance prop and pass through original props with a class component', async () => {
    class ComponentToWrap extends React.Component<ComponentToWrapProps> {
      // eslint-disable-next-line react/sort-comp
      componentDidMount() {
        const { createWebChatInstance } = this.props;
        createWebChatInstance(this.webChatOptions);
      }

      webChatOnLoad = (instance: WebChatInstance) => {
        instance.render();
      };

      // eslint-disable-next-line react/sort-comp
      webChatOptions: WebChatConfig = {
        integrationID: 'f38e21ee-d79c-4427-859c-4fdd9bbed8f1',
        region: 'us-south',
        serviceInstanceID: '981593e2-2d49-41f2-81d1-1bbdfb4f7898',
        openChatByDefault: true,
        onLoad: this.webChatOnLoad,
      };

      render() {
        const { location } = this.props;
        return <div>I am here in {location}!</div>;
      }
    }

    const WasWrappedComponent = withWebChat({ debug: true })(ComponentToWrap);
    const { getByText, getAllByText } = render(<WasWrappedComponent location="Boston" />);
    // Extra props are correctly passed.
    expect(getByText('Boston', { exact: false })).toBeInTheDocument();
    await waitFor(
      () => {
        expect(getAllByText('Watson Assistant', { exact: false }).length).toBeTruthy();
      },
      { timeout: 10000 },
    );
  });

  it('should load web chat via createWebChatInstance prop and pass through original props and a ref', async () => {
    const ComponentToWrap = React.forwardRef((props: ComponentToWrapProps, ref: React.RefObject<HTMLInputElement>) => {
      const { location, createWebChatInstance } = props;
      React.useEffect(() => {
        createWebChatInstance({
          integrationID: 'f38e21ee-d79c-4427-859c-4fdd9bbed8f1',
          region: 'us-south',
          serviceInstanceID: '981593e2-2d49-41f2-81d1-1bbdfb4f7898',
          openChatByDefault: true,
          onLoad: (instance: WebChatInstance) => {
            instance.render();
          },
        });
      }, []);
      return (
        <div>
          I am from {location}: <input type="text" ref={ref} placeholder="Where are you from?" />
        </div>
      );
    });
    const WasWrappedComponent = withWebChat({ debug: true })(ComponentToWrap);
    class App extends React.Component {
      locationRef = React.createRef<HTMLInputElement>();

      onClickButton() {
        if (this && this.locationRef && this.locationRef.current) {
          this.locationRef.current.focus();
        }
      }

      render() {
        return (
          <div>
            <WasWrappedComponent ref={this.locationRef} location="Boston" />
            <button data-testid="focus-button" type="button" onClick={() => this.onClickButton()}>
              Click me to focus on input
            </button>
          </div>
        );
      }
    }
    const { getByText, getAllByText, getByPlaceholderText, getByTestId } = render(<App />);
    // Extra props are correctly passed.
    expect(getByText('Boston', { exact: false })).toBeInTheDocument();
    await waitFor(
      () => {
        expect(getAllByText('Watson Assistant', { exact: false }).length).toBeTruthy();
      },
      { timeout: 10000 },
    );
    const button = getByTestId('focus-button');
    fireEvent.click(button);
    expect(getByPlaceholderText('Where are you from?')).toHaveFocus();
  });
});
