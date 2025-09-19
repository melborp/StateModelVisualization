import React from 'react';
import ReactDOM from 'react-dom';
import * as SDK from 'azure-devops-extension-sdk';
import App from './components/App';

console.log('App.tsx entry point started');

// Initialize the Azure DevOps SDK
SDK.init().then(() => {
  console.log('Azure DevOps SDK initialized successfully');
  
  // Notify the parent frame that the extension is ready
  SDK.notifyLoadSucceeded();
  
  // Clear the loading fallback
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = '';
  }
  
  // Render the React application
  ReactDOM.render(<App />, root);
  console.log('React app rendered');
}).catch((error) => {
  console.error('Failed to initialize Azure DevOps SDK:', error);
  SDK.notifyLoadFailed(error);
  
  // Show error in UI
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: #d13438; text-align: center;">
      <h3>Extension Load Failed</h3>
      <p>Error: ${error.message || error}</p>
      <p>Please check the browser console for more details.</p>
    </div>`;
  }
});