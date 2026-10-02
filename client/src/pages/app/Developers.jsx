import { useState } from 'react';
import PageHeader from '@components/app/ui/PageHeader';
import { FiCopy, FiCheck, FiTerminal } from 'react-icons/fi';
import { SiNodedotjs, SiPython, SiPhp } from 'react-icons/si';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const emailExamples = {
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

const smsExamples = {
  curl: {
    label: 'cURL',
    icon: FiTerminal,
    language: 'bash',
    code: `curl -X POST ${API_URL}/sms/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "254712345678",
    "content": "Your verification code is 123456",
    "sender": "HDM BRIDGE"
  }'`,
  },
  node: {
    label: 'Node.js',
    icon: SiNodedotjs,
    language: 'javascript',
    code: `const axios = require('axios');

const sendSms = async () => {
  const { data } = await axios.post(
    '${API_URL}/sms/send',
    {
      to: '254712345678',
      content: 'Your verification code is 123456',
      sender: 'HDM BRIDGE',
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

sendSms();`,
  },
  python: {
    label: 'Python',
    icon: SiPython,
    language: 'python',
    code: `import os
import requests

response = requests.post(
    "${API_URL}/sms/send",
    headers={
        "Authorization": f"Bearer {os.getenv('HDM_API_KEY')}",
        "Content-Type": "application/json",
    },
    json={
        "to": "254712345678",
        "content": "Your verification code is 123456",
        "sender": "HDM BRIDGE",
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
$url = '${API_URL}/sms/send';

$data = [
    'to' => '254712345678',
    'content' => 'Your verification code is 123456',
    'sender' => 'HDM BRIDGE',
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
  const [channel, setChannel] = useState('email');
  const [activeTab, setActiveTab] = useState('curl');
  const [copied, setCopied] = useState(false);

  const examples = channel === 'email' ? emailExamples : smsExamples;
  const current = examples[activeTab] || examples.curl;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const switchChannel = (next) => {
    setChannel(next);
    setActiveTab('curl');
    setCopied(false);
  };

  return (
    <>
      <PageHeader title="Developers" description="Integrate HDM BRIDGE into your application" />

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

      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => switchChannel('email')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            channel === 'email' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Email
        </button>
        <button
          onClick={() => switchChannel('sms')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            channel === 'sms' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          SMS
        </button>
      </div>

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
            <code>{current.code}</code>
          </pre>
        </div>
      </div>

      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📖 API Reference — {channel === 'email' ? 'Email' : 'SMS'}
        </h3>

        {channel === 'email' ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Send Email</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                <p>
                  <span className="font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">POST</span>{' '}
                  <code className="text-gray-700">{API_URL}/emails/send</code>
                </p>
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
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Send SMS</h4>
              <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
                <p>
                  <span className="font-mono bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">POST</span>{' '}
                  <code className="text-gray-700">{API_URL}/sms/send</code>
                </p>
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
                  <tr className="border-b"><td className="py-2 font-mono text-xs">to</td><td className="py-2">string</td><td className="py-2">✅</td><td className="py-2">Recipient phone in international format (e.g. 254712345678)</td></tr>
                  <tr className="border-b"><td className="py-2 font-mono text-xs">content</td><td className="py-2">string</td><td className="py-2">✅</td><td className="py-2">Message body (max 160 chars)</td></tr>
                  <tr className="border-b"><td className="py-2 font-mono text-xs">sender</td><td className="py-2">string</td><td className="py-2">—</td><td className="py-2">Sender name (default: HDM BRIDGE)</td></tr>
                  <tr><td className="py-2 font-mono text-xs">type</td><td className="py-2">string</td><td className="py-2">—</td><td className="py-2">transactional or marketing (default: transactional)</td></tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700">{`{
  "success": true,
  "messageId": "sms_abc123_xyz",
  "status": "sent",
  "creditsUsed": 1
}`}</pre>
              </div>
            </div>

            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
              <strong>SMS availability:</strong> SMS is delivered via Brevo and requires SMS credits on your account.
              Check your plan limits under <a href="/billing" className="underline">Billing</a>.
            </div>
          </div>
        )}
      </div>
    </>
  );
}