import React, { useEffect, useState } from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import { Button } from 'azure-devops-ui/Button';
import { MessageCard, MessageCardSeverity } from 'azure-devops-ui/MessageCard';
import { Spinner, SpinnerSize } from 'azure-devops-ui/Spinner';

interface PrintData {
  imageData: string;
  workItemTypeName: string;
  generatedDate: string;
  generatedTime: string;
}

const PrintGraph: React.FC = () => {
  const [printData, setPrintData] = useState<PrintData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializePrint = async () => {
      try {
        // Initialize SDK
        await SDK.init();
        await SDK.ready();

        // Get configuration passed from the dialog caller
        const config = SDK.getConfiguration();

        if (config) {
          setPrintData({
            imageData: config.imageData,
            workItemTypeName: config.workItemTypeName,
            generatedDate: config.generatedDate,
            generatedTime: config.generatedTime
          });
        }
      } catch (error) {
        console.error('Failed to initialize print view:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePrint();
  }, []);

  const handlePrint = () => {
    try {
      // Focus window for better print experience
      window.focus();
      
      // Unfortunately, we cannot programmatically set "Fit to printable area"
      // This is controlled by browser print dialog user preferences
      // But our CSS is designed to work well with default settings
      window.print();
    } catch (error) {
      console.error('Print failed:', error);
    }
  };


  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <Spinner size={SpinnerSize.large} label="Loading print preview..." />
      </div>
    );
  }

  if (!printData) {
    return (
      <div style={{
        padding: '40px',
        fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <MessageCard severity={MessageCardSeverity.Error}>
          No print data available. Please try again.
        </MessageCard>
      </div>
    );
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { 
            display: none !important; 
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          html, body {
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          
          .print-container { 
            width: 100% !important; 
            height: auto !important; 
            max-width: none !important;
            margin: 0 !important;
            padding: 15mm !important;
            page-break-inside: avoid;
            overflow: visible !important;
          }
          
          .print-image {
            max-width: 100% !important;
            max-height: 80vh !important;
            width: auto !important;
            height: auto !important;
            page-break-inside: avoid;
            display: block !important;
            margin: 0 auto !important;
            object-fit: contain !important;
          }
          
          h1 {
            page-break-after: avoid;
            margin-bottom: 10mm !important;
          }
          
          .print-header {
            page-break-after: avoid;
            margin-bottom: 10mm !important;
          }
          
          .print-footer {
            page-break-before: avoid;
            margin-top: 10mm !important;
          }
        }
        
        @media screen {
          .print-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
          }
        }
      `}</style>
      {/* Print content */}
      <div className="print-container" style={{
        fontFamily: '"Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
        lineHeight: '1.5',
        color: '#323130',
        padding: '20px'
      }}>
        {/* Print instruction and action - screen only */}
        <div className="no-print" style={{
          backgroundColor: '#f3f2f1',
          padding: '20px',
          borderRadius: '6px',
          marginBottom: '32px',
          border: '1px solid #e1dfdd',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#605e5c',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>ℹ️</span>
            Ready to print your state diagram.
          </div>
          <Button
            text="Print Diagram"
            primary={true}
            iconProps={{ iconName: 'Print' }}
            onClick={handlePrint}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          />
          <div style={{
            fontSize: '12px',
            color: '#605e5c',
            marginTop: '12px'
          }}>
            💡 Tip: In the print dialog, select "More settings" → "Fit to page" for best results
          </div>
        </div>

        {/* Header */}
        <div className="print-header" style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: '600',
            margin: '0 0 10px 0',
            color: '#323130'
          }}>
            State Diagram: {printData.workItemTypeName}
          </h1>
          <div style={{
            fontSize: '14px',
            color: '#605e5c',
            marginBottom: '20px'
          }}>
            Generated on {printData.generatedDate} at {printData.generatedTime}
          </div>
        </div>

        {/* Graph Image */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <img
            src={printData.imageData}
            alt={`State diagram for ${printData.workItemTypeName}`}
            className="print-image"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #e1e5e9',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          />
        </div>

        {/* Footer */}
        <div className="print-footer" style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#605e5c',
          borderTop: '1px solid #e1e5e9',
          paddingTop: '20px'
        }}>
          Generated by State Model Visualization Extension
        </div>
      </div>
    </>
  );
};

export default PrintGraph;