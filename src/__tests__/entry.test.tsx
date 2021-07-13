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
import '@testing-library/jest-dom';
import React from 'react';
import { render, waitFor } from '@testing-library/react';

import { AddedWithWebChatProps, WebChatInstance } from '../types';
import { withWebChat } from '../entry';

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
        }).then((instance) => {
          instance.render();
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
      componentDidMount() {
        const { createWebChatInstance } = this.props;
        createWebChatInstance({
          integrationID: 'f38e21ee-d79c-4427-859c-4fdd9bbed8f1',
          region: 'us-south',
          serviceInstanceID: '981593e2-2d49-41f2-81d1-1bbdfb4f7898',
          openChatByDefault: true,
        }).then((instance: WebChatInstance) => {
          instance.render();
        });
      }

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
});
