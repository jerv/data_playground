import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DebugPanel: React.FC = () => {
  const [apiUrl, setApiUrl] = useState<string>('');
  const [windowEnv, setWindowEnv] = useState<any>(null);
  const [processEnv, setProcessEnv] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    // Get API URL from different sources
    const windowEnvUrl = (window as any).env?.REACT_APP_API_URL;
    const processEnvUrl = process.env.REACT_APP_API_URL;
    const fallbackUrl = 'https://data-playground.onrender.com/api';
    
    setApiUrl(windowEnvUrl || processEnvUrl || fallbackUrl);
    setWindowEnv((window as any).env || {});
    setProcessEnv(process.env || {});
  }, []);

  const testConnection = async () => {
    setTestStatus('loading');
    setTestResult('Testing connection...');
    
    try {
      const response = await axios.get(`${apiUrl}/test`, {
        timeout: 10000
      });
      setTestStatus('success');
      setTestResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setTestStatus('error');
      if (axios.isAxiosError(error)) {
        setTestResult(`Error: ${error.message}\n${error.response ? JSON.stringify(error.response.data, null, 2) : 'No response data'}`);
      } else {
        setTestResult(`Error: ${String(error)}`);
      }
    }
  };

  const testRegistration = async () => {
    setTestStatus('loading');
    setTestResult('Testing registration...');
    
    try {
      const response = await axios.post(`${apiUrl}/auth/register`, {
        username: `testuser${Math.floor(Math.random() * 10000)}`,
        email: `testuser${Math.floor(Math.random() * 10000)}@example.com`,
        password: 'Password123!',
        registrationCode: 'welcome123'
      }, {
        timeout: 10000
      });
      setTestStatus('success');
      setTestResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setTestStatus('error');
      if (axios.isAxiosError(error)) {
        setTestResult(`Error: ${error.message}\n${error.response ? JSON.stringify(error.response.data, null, 2) : 'No response data'}`);
      } else {
        setTestResult(`Error: ${String(error)}`);
      }
    }
  };

  if (!isExpanded) {
    return (
      <div 
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg cursor-pointer z-50"
        onClick={() => setIsExpanded(true)}
      >
        🛠️
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 w-96 max-h-[80vh] overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Debug Panel</h3>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setIsExpanded(false)}
        >
          ✕
        </button>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold mb-1">API URL:</h4>
        <div className="bg-gray-100 p-2 rounded text-sm break-all">
          {apiUrl || 'Not set'}
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold mb-1">Environment:</h4>
        <div className="bg-gray-100 p-2 rounded text-sm">
          <p><strong>window.env:</strong> {JSON.stringify(windowEnv)}</p>
          <p className="mt-1"><strong>process.env.NODE_ENV:</strong> {processEnv.NODE_ENV || 'Not set'}</p>
          <p className="mt-1"><strong>process.env.REACT_APP_API_URL:</strong> {processEnv.REACT_APP_API_URL || 'Not set'}</p>
        </div>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button 
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          onClick={testConnection}
        >
          Test Connection
        </button>
        <button 
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          onClick={testRegistration}
        >
          Test Registration
        </button>
      </div>
      
      {testStatus !== 'idle' && (
        <div className={`p-2 rounded text-sm ${
          testStatus === 'loading' ? 'bg-yellow-100' :
          testStatus === 'success' ? 'bg-green-100' :
          'bg-red-100'
        }`}>
          <pre className="whitespace-pre-wrap">{testResult}</pre>
        </div>
      )}
    </div>
  );
};

export default DebugPanel; 