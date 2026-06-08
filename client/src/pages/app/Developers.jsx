import { useState } from 'react';
import PageHeader from '@components/app/ui/PageHeader';
import { FiCopy, FiCheck, FiCode, FiTerminal } from 'react-icons/fi';
import { SiNodedotjs, SiPython, SiPhp } from 'react-icons/si';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const examples = {
  curl: {
    label: 'cURL',
    icon: FiTerminal,
    language: 'bash',
    code: `curl -X POST ${API_URL}/emails/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "notifications@yourdomain.com",
    "fromName": "Your App Name",
    "to": "customer@example.com",
    "subject": "Hello from HDM BRIDGE",
    "htmlBody": "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
    "textBody": "Welcome! Thanks for signing up."
  }'`,
  },
  node: {
    label: 'Node.js',
    icon: SiNodedotjs,
    language: 'javascript',
    code: `const axios = require('axios');

const sendEmail = async () => {
  const { data } = await axios.post(
    '${API_URL}/emails/send',
    {
      from: 'notifications@yourdomain.com',
      fromName: 'Your App Name',
      to: 'customer@example.com',
      subject: 'Hello from HDM BRIDGE',
      htmlBody: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
      textBody: 'Welcome! Thanks for signing up.',
    },
    {
      headers: {
        'Authorization': 'Bearer ' + process.env.HDM_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  console.log('Sent:', data.messageId);
};

sendEmail();`,
  },
  python: {
    label: 'Python',
    icon: SiPython,
    language: 'python',
    code: `import os
import requests

response = requests.post(
    "${API_URL}/emails/send",
    headers={
        "Authorization": f"Bearer {os.getenv('HDM_API_KEY')}",
        "Content-Type": "application/json",
    },
    json={
        "from": "notifications@yourdomain.com",
        "fromName": "Your App Name",
        "to": "customer@example.com",
        "subject": "Hello from HDM BRIDGE",
        "htmlBody": "<h1>Welcome!</h1><p>Thanks for signing up.</p>",
        "textBody": "Welcome! Thanks for signing up.",
    },
)

print(response.json()["messageId"])`,
  },
  php: {
    label: 'PHP',
    icon: SiPhp,
    language: 'php',
    code: `<?php
$apiKey = getenv('HDM_API_KEY');
$url = '${API_URL}/emails/send';

$data = [
    'from' => 'notifications@yourdomain.com',
    'fromName' => 'Your App Name',
    'to' => 'customer@example.com',
    'subject' => 'Hello from HDM BRIDGE',
    'htmlBody' => '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
    'textBody' => 'Welcome! Thanks for signing up.',
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo json_decode($response, true)['messageId'];
?>`,
  },
};

export default function Developers() {
  const [activeTab, setActiveTab] = useState('curl');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(examples[activeTab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const ActiveIcon = examples[activeTab].icon;

  return (
    <>
      <PageHeader title="Developers" description="Integrate HDM BRIDGE into your application" />

      {/* Quick Start */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Quick Start</h3>
        <p className="text-sm text-gray-500 mb-4">
          Get your API key from the <a href="/api-keys" className="text-indigo-600 hover:underline">API Keys</a> page, then choose your language below.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 text-sm">
          <p className="text-gray-600 mb-2">Environment variable:</p>
          <code className="bg-gray-900 text-green-400 px-3 py-1.5 rounded-lg text-xs block">
            HDM_API_KEY=hdm_your_api_key_here
          </code>
        </div>
      </div>

      {/* Code Examples */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {Object.entries(examples).map(([key, ex]) => {
              const Icon = ex.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} /> {ex.label}
                </button>
              );
            })}
          </div>
          <button onClick={handleCopy} className={`btn-sm rounded-lg flex items-center gap-2 ${copied ? 'bg-green-600 text-white' : 'btn-secondary'}`}>
            {copied ? <><FiCheck size={14} /> Copied</> : <><FiCopy size={14} /> Copy</>}
          </button>
        </div>
        <div className="bg-gray-900 rounded-xl p-5 overflow-x-auto">
          <pre className="text-sm text-gray-100 font-mono leading-relaxed whitespace-pre">
            <code>{examples[activeTab].code}</code>
          </pre>
        </div>
      </div>

      {/* API Reference */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📖 API Reference</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Send Email</h4>
            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
              <p><span className="font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">POST</span> <code className="text-gray-700">{API_URL}/emails/send</code></p>
              <p className="text-gray-500"><strong>Auth:</strong> Bearer API_KEY</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Parameters</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 text-gray-500 font-medium">Field</th>
                  <th className="py-2 text-gray-500 font-medium">Type</th>
                  <th className="py-2 text-gray-500 font-medium">Required</th>
                  <th className="py-2 text-gray-500 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b"><td className="py-2 font-mono text-xs">to</td><td className="py-2">string</td><td className="py-2">✅</td><td className="py-2">Recipient email</td></tr>
                <tr className="border-b"><td className="py-2 font-mono text-xs">subject</td><td className="py-2">string</td><td className="py-2">✅</td><td className="py-2">Email subject</td></tr>
                <tr className="border-b"><td className="py-2 font-mono text-xs">htmlBody</td><td className="py-2">string</td><td className="py-2">✅</td><td className="py-2">HTML content</td></tr>
                <tr className="border-b"><td className="py-2 font-mono text-xs">from</td><td className="py-2">string</td><td className="py-2">—</td><td className="py-2">Sender email</td></tr>
                <tr className="border-b"><td className="py-2 font-mono text-xs">fromName</td><td className="py-2">string</td><td className="py-2">—</td><td className="py-2">Sender name</td></tr>
                <tr className="border-b"><td className="py-2 font-mono text-xs">textBody</td><td className="py-2">string</td><td className="py-2">—</td><td className="py-2">Plain text version</td></tr>
                <tr className="border-b"><td className="py-2 font-mono text-xs">replyTo</td><td className="py-2">string</td><td className="py-2">—</td><td className="py-2">Reply-to email</td></tr>
                <tr><td className="py-2 font-mono text-xs">templateId</td><td className="py-2">string</td><td className="py-2">—</td><td className="py-2">Use a saved template</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700">{`{
  "success": true,
  "messageId": "hdm_abc123_xyz",
  "status": "queued"
}`}</pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}