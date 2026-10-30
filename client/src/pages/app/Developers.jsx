import { useEffect, useState } from 'react';
import PageHeader from '@components/app/ui/PageHeader';
import { FiCopy, FiCheck, FiTerminal } from 'react-icons/fi';
import { SiNodedotjs, SiPython, SiPhp } from 'react-icons/si';
import { sendersAPI } from '@api/senders';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const PLACEHOLDER_FROM_EMAIL = 'noreply@hdmbridge.com';
const PLACEHOLDER_FROM_NAME = 'Your App Name';

function CopyIconButton({ getText, className = '' }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`btn-sm rounded-lg flex items-center gap-2 ${copied ? 'bg-green-600 text-white' : 'btn-secondary'} ${className}`}
    >
      {copied ? <><FiCheck size={14} /> Copied</> : <><FiCopy size={14} /> Copy</>}
    </button>
  );
}

function CodeBlock({ code, label }) {
  return (
    <div>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
          {label}
        </p>
      )}
      <div className="relative">
        <div className="absolute top-3 right-3 z-10">
          <CopyIconButton getText={() => code} />
        </div>
        <div className="bg-gray-900 rounded-xl p-5 pr-24 overflow-x-auto">
          <pre className="text-sm text-gray-100 font-mono leading-relaxed whitespace-pre">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

const buildEmailExamples = ({ fromEmail }) => {
  const resolvedFromEmail = fromEmail || PLACEHOLDER_FROM_EMAIL;

  return {
    curl: {
      label: 'cURL',
      icon: FiTerminal,
      code: `curl -X POST ${API_URL}/emails/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "${resolvedFromEmail}",
    "fromName": "${PLACEHOLDER_FROM_NAME}",
    "to": "customer@example.com",
    "subject": "Hello",
    "htmlBody": "<h1>Hi!</h1>"
  }'`,
    },
    node: {
      label: 'Node.js',
      icon: SiNodedotjs,
      code: `const axios = require('axios');

axios.post('${API_URL}/emails/send', {
  from: '${resolvedFromEmail}',
  fromName: '${PLACEHOLDER_FROM_NAME}',
  to: 'customer@example.com',
  subject: 'Hello',
  htmlBody: '<h1>Hi!</h1>',
}, {
  headers: { Authorization: 'Bearer ' + process.env.HDM_API_KEY },
});`,
    },
    python: {
      label: 'Python',
      icon: SiPython,
      code: `import os
import requests

requests.post(
    "${API_URL}/emails/send",
    headers={"Authorization": f"Bearer {os.getenv('HDM_API_KEY')}"},
    json={
        "from": "${resolvedFromEmail}",
        "fromName": "${PLACEHOLDER_FROM_NAME}",
        "to": "customer@example.com",
        "subject": "Hello",
        "htmlBody": "<h1>Hi!</h1>",
    },
)`,
    },
    php: {
      label: 'PHP',
      icon: SiPhp,
      code: `<?php
$payload = [
    'from' => '${resolvedFromEmail}',
    'fromName' => '${PLACEHOLDER_FROM_NAME}',
    'to' => 'customer@example.com',
    'subject' => 'Hello',
    'htmlBody' => '<h1>Hi!</h1>',
];

$ch = curl_init('${API_URL}/emails/send');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . getenv('HDM_API_KEY'),
    'Content-Type: application/json',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
echo curl_exec($ch);`,
    },
  };
};

const smsExamples = {
  curl: {
    label: 'cURL',
    icon: FiTerminal,
    code: `curl -X POST ${API_URL}/sms/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "254712345678",
    "content": "Your code is 123456"
  }'`,
  },
  node: {
    label: 'Node.js',
    icon: SiNodedotjs,
    code: `const axios = require('axios');

axios.post('${API_URL}/sms/send', {
  to: '254712345678',
  content: 'Your code is 123456',
}, {
  headers: { Authorization: 'Bearer ' + process.env.HDM_API_KEY },
});`,
  },
  python: {
    label: 'Python',
    icon: SiPython,
    code: `import os
import requests

requests.post(
    "${API_URL}/sms/send",
    headers={"Authorization": f"Bearer {os.getenv('HDM_API_KEY')}"},
    json={
        "to": "254712345678",
        "content": "Your code is 123456",
    },
)`,
  },
  php: {
    label: 'PHP',
    icon: SiPhp,
    code: `<?php
$payload = [
    'to' => '254712345678',
    'content' => 'Your code is 123456',
];

$ch = curl_init('${API_URL}/sms/send');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . getenv('HDM_API_KEY'),
    'Content-Type: application/json',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
echo curl_exec($ch);`,
  },
};

const buildEnvExamples = ({ fromEmail }) => {
  const resolvedFromEmail = fromEmail || PLACEHOLDER_FROM_EMAIL;

  const envFile = `HDM_API_KEY=hdm_your_api_key_here
HDM_API_URL=${API_URL}
HDM_FROM_EMAIL=${resolvedFromEmail}
HDM_FROM_NAME=${PLACEHOLDER_FROM_NAME}`;

  return {
    node: {
      label: 'Node.js',
      icon: SiNodedotjs,
      fileName: '.env',
      hint: 'Loaded by dotenv, or Node 20+ with --env-file.',
      code: envFile,
      usage: `// sendEmail.js
require('dotenv').config();

const { HDM_API_KEY, HDM_API_URL, HDM_FROM_EMAIL, HDM_FROM_NAME } = process.env;

axios.post(HDM_API_URL + '/emails/send', {
  from: HDM_FROM_EMAIL,
  fromName: HDM_FROM_NAME,
  to: 'customer@example.com',
  subject: 'Hello',
  htmlBody: '<h1>Hi!</h1>',
}, {
  headers: { Authorization: 'Bearer ' + HDM_API_KEY },
});`,
    },
    python: {
      label: 'Python',
      icon: SiPython,
      fileName: '.env',
      hint: 'Load with python-dotenv.',
      code: envFile,
      usage: `# send_email.py
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("HDM_API_KEY")
API_URL = os.getenv("HDM_API_URL")
FROM_EMAIL = os.getenv("HDM_FROM_EMAIL")
FROM_NAME = os.getenv("HDM_FROM_NAME")

requests.post(
    API_URL + "/emails/send",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "from": FROM_EMAIL,
        "fromName": FROM_NAME,
        "to": "customer@example.com",
        "subject": "Hello",
        "htmlBody": "<h1>Hi!</h1>",
    },
)`,
    },
    php: {
      label: 'PHP',
      icon: SiPhp,
      fileName: '.env',
      hint: 'Load with vlucas/phpdotenv.',
      code: envFile,
      usage: `<?php
require __DIR__ . '/vendor/autoload.php';

Dotenv\\Dotenv::createImmutable(__DIR__)->load();

$payload = [
    'from' => $_ENV['HDM_FROM_EMAIL'],
    'fromName' => $_ENV['HDM_FROM_NAME'],
    'to' => 'customer@example.com',
    'subject' => 'Hello',
    'htmlBody' => '<h1>Hi!</h1>',
];

$ch = curl_init($_ENV['HDM_API_URL'] . '/emails/send');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $_ENV['HDM_API_KEY'],
    'Content-Type: application/json',
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
echo curl_exec($ch);`,
    },
  };
};

export default function Developers() {
  const [channel, setChannel] = useState('email');
  const [activeTab, setActiveTab] = useState('curl');
  const [platformSenders, setPlatformSenders] = useState([]);
  const [platformLoading, setPlatformLoading] = useState(true);
  const [envTab, setEnvTab] = useState('node');

  useEffect(() => {
    sendersAPI.getPlatform()
      .then((res) => setPlatformSenders(res?.data?.senders || []))
      .catch(() => {})
      .finally(() => setPlatformLoading(false));
  }, []);

  const recommendedSender = platformSenders.find((s) => s.isDefault) || platformSenders[0] || null;

  const emailExamples = buildEmailExamples({ fromEmail: recommendedSender?.email });
  const envExamples = buildEnvExamples({ fromEmail: recommendedSender?.email });

  const examples = channel === 'email' ? emailExamples : smsExamples;
  const current = examples[activeTab] || examples.curl;
  const currentEnv = envExamples[envTab];

  const switchChannel = (next) => {
    setChannel(next);
    setActiveTab('curl');
  };

  return (
    <>
      <PageHeader title="Developers" description="Integrate HDM BRIDGE into your application" />

      <div className="card mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Quick Start</h3>
        <p className="text-sm text-gray-500 mb-4">
          Get your API key from the <a href="/api-keys" className="text-indigo-600 hover:underline">API Keys</a> page.
        </p>
        <CodeBlock
          label=".env"
          code={`HDM_API_KEY=hdm_your_api_key_here
HDM_API_URL=${API_URL}
HDM_FROM_EMAIL=${recommendedSender?.email || PLACEHOLDER_FROM_EMAIL}
HDM_FROM_NAME=${PLACEHOLDER_FROM_NAME}`}
        />
      </div>

      <div className="card mb-6 bg-indigo-50 border-indigo-200">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-indigo-900">Available senders</h3>
            <p className="text-xs text-indigo-700 mt-1">
              Use any of these verified addresses in your "from" field — no domain setup required.
            </p>
          </div>
        </div>

        {platformLoading ? (
          <p className="text-xs text-indigo-700">Loading…</p>
        ) : platformSenders.length === 0 ? (
          <p className="text-xs text-indigo-700">No platform senders available yet.</p>
        ) : (
          <div className="space-y-2">
            {platformSenders.map((s) => (
              <div key={s._id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                    {s.isDefault && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-mono truncate">{s.email}</p>
                </div>
                <CopyIconButton getText={() => s.email} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🔐 Environment Variables</h3>
            <p className="text-sm text-gray-500">
              Never hardcode your API key. Store it in a <code className="font-mono text-xs bg-gray-100 px-1 rounded">.env</code> file (and add that file to <code className="font-mono text-xs bg-gray-100 px-1 rounded">.gitignore</code>).
            </p>
          </div>
        </div>

        <div className="mb-4 text-xs">
          {recommendedSender ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <code className="font-mono">HDM_FROM_EMAIL</code> pre-filled from{' '}
              <strong className="font-mono">{recommendedSender.email}</strong>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              No platform sender — add one on the Senders page to auto-fill this.
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-4 w-fit">
          {Object.entries(envExamples).map(([key, ex]) => {
            const Icon = ex.icon;
            return (
              <button
                key={key}
                onClick={() => setEnvTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  envTab === key ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={16} /> {ex.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CodeBlock label={currentEnv.fileName} code={currentEnv.code} />
          <CodeBlock label="How to read it" code={currentEnv.usage} />
        </div>

        <p className="text-xs text-gray-500 mt-3">{currentEnv.hint}</p>

        <div className="mt-4 rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
          <strong>Keep your key secret.</strong> If a key is ever exposed, revoke it on the <a href="/api-keys" className="underline">API Keys</a> page and generate a new one.
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
        </div>
        <CodeBlock code={current.code} />
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
                  <tr className="border-b"><td className="py-2 font-mono text-xs">from</td><td className="py-2">string</td><td className="py-2">—</td><td className="py-2">Sender email (use a platform sender or your own verified sender)</td></tr>
                  <tr className="border-b"><td className="py-2 font-mono text-xs">fromName</td><td className="py-2">string</td><td className="py-2">—</td><td className="py-2">Sender name</td></tr>
                  <tr className="border-b"><td className="py-2 font-mono text-xs">textBody</td><td className="py-2">string</td><td className="py-2">—</td><td className="py-2">Plain text version</td></tr>
                  <tr className="border-b"><td className="py-2 font-mono text-xs">replyTo</td><td className="py-2">string</td><td className="py-2">—</td><td className="py-2">Reply-to email</td></tr>
                  <tr><td className="py-2 font-mono text-xs">templateId</td><td className="py-2">string</td><td className="py-2">—</td><td className="py-2">Use a saved template</td></tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
              <CodeBlock
                code={`{
  "success": true,
  "messageId": "hdm_abc123_xyz",
  "status": "queued"
}`}
              />
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
              <CodeBlock
                code={`{
  "success": true,
  "messageId": "sms_abc123_xyz",
  "status": "sent",
  "creditsUsed": 1
}`}
              />
            </div>

            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
              <strong>SMS availability:</strong> SMS is a paid channel and is not included in the free email quota. Contact support to enable SMS on your account.
            </div>
          </div>
        )}
      </div>
    </>
  );
}