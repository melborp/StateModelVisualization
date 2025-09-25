import React, { Component } from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import { IHostPageLayoutService } from 'azure-devops-extension-api';
import { Header, TitleSize } from 'azure-devops-ui/Header';
import { IHeaderCommandBarItem } from 'azure-devops-ui/HeaderCommandBar';
import { Page } from 'azure-devops-ui/Page';
import { StateVisualizationTab } from './StateVisualizationTab';

interface IAppState {
  fullScreenMode: boolean;
}

class App extends Component<{}, IAppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      fullScreenMode: false
    };
  }

  public async componentDidMount() {
    await SDK.ready();
    await this.initializeFullScreenState();
  }

  public render(): JSX.Element {
    return (
      <Page className="state-model-hub flex-grow">
        <Header 
          title="State Model Visualization"
          commandBarItems={this.getCommandBarItems()}
          description="Visualize work item type state transitions and workflow"
          titleSize={TitleSize.Medium} 
        />
        <div style={{ 
          padding: '24px 32px',
          height: 'calc(100vh - 140px)', // Account for header height
          overflow: 'hidden'
        }}>
          <StateVisualizationTab />
        </div>
      </Page>
    );
  }

  private getCommandBarItems(): IHeaderCommandBarItem[] {
    return [
      {
        id: 'fullScreen',
        text: this.state.fullScreenMode ? 'Exit full screen' : 'Enter full screen mode',
        iconProps: {
          iconName: this.state.fullScreenMode ? 'BackToWindow' : 'FullScreen'
        },
        onActivate: () => { this.onToggleFullScreenMode(); }
      }
    ];
  }

  private async initializeFullScreenState() {
    try {
      const layoutService = await SDK.getService<IHostPageLayoutService>(
        'ms.vss-features.host-page-layout-service'
      );
      const fullScreenMode = await layoutService.getFullScreenMode();
      if (fullScreenMode !== this.state.fullScreenMode) {
        this.setState({ fullScreenMode });
      }
    } catch (err) {
      console.warn('Could not initialize full screen state:', err);
    }
  }

  private async onToggleFullScreenMode(): Promise<void> {
    const fullScreenMode = !this.state.fullScreenMode;
    this.setState({ fullScreenMode });
    
    try {
      const layoutService = await SDK.getService<IHostPageLayoutService>(
        'ms.vss-features.host-page-layout-service'
      );
      layoutService.setFullScreenMode(fullScreenMode);
    } catch (err) {
      console.warn('Could not toggle full screen mode:', err);
    }
  }
}

export default App;
