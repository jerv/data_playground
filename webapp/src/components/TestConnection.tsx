import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestConnection: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        setStatus('loading');
        setMessage('Testing connection to backend...');
        setApiUrl(process.env.REACT_APP_API_URL || 'http://localhost:5000/api');
        
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/test`);
        
        setStatus('success');
        setMessage(`Connection successful! Response: ${JSON.stringify(response.data)}`);
      } catch (error) {
        setStatus('error');
        if (axios.isAxiosError(error)) {
          setMessage(`Connection error: ${error.message}. ${error.response ? `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` : 'No response data'}`);
        } else {
          setMessage(`Connection error: ${String(error)}`);
        }
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-2">Backend Connection Test</h2>
      <p className="mb-2">API URL: {apiUrl}</p>
      <div className={`p-3 rounded ${
        status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
        status === 'success' ? 'bg-green-100 text-green-800' :
        'bg-red-100 text-red-800'
      }`}>
        {message}
      </div>
      
      <div className="mt-4">
        <h3 className="font-bold">Manual Test Registration</h3>
        <button 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={async () => {
            try {
              setStatus('loading');
              setMessage('Testing registration endpoint...');
              
              const response = await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/register`, 
                {
                  username: 'testuser' + Math.floor(Math.random() * 10000),
                  email: `testuser${Math.floor(Math.random() * 10000)}@example.com`,
                  password: 'password123',
                  registrationCode: 'welcome123'
                }
              );
              
              setStatus('success');
              setMessage(`Registration test successful! Response: ${JSON.stringify(response.data)}`);
            } catch (error) {
              setStatus('error');
              if (axios.isAxiosError(error)) {
                setMessage(`Registration error: ${error.message}. ${error.response ? `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}` : 'No response data'}`);
              } else {
                setMessage(`Registration error: ${String(error)}`);
              }
            }
          }}
        >
          Test Registration
        </button>
      </div>
    </div>
  );
};

export default TestConnection; 