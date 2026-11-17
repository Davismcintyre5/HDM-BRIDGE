import { useState, useEffect } from 'react';
import LegalModal from './LegalModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Footer() {
  const [modal, setModal] = useState(null);
  const [settings, setSettings] = useState({
    supportEmail: 'support@hdmbridge.com',
    contactPhone: '',
    appName: 'HDM BRIDGE',
  });
  const [legal, setLegal] = useState({ terms: null, privacy: null });

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!modal) return;
    const type = modal === 'terms' ? 'terms_of_service' : 'privacy_policy';
    if (legal[modal]) return;
    fetch(`${API_URL}/landing/legal/${type}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.success && d.document) {
          setLegal((prev) => ({ ...prev, [modal]: d.document }));
        }
      })
      .catch(() => {});
  }, [modal, legal]);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_URL}/landing/settings`);
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings({
          supportEmail: data.settings.support_email || settings.supportEmail,
          contactPhone: data.settings.contact_phone || '',
          appName: data.settings.app_name || settings.appName,
        });
      }
    } catch {}
  };

  return (
    <>
      <footer id="contact" className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="text-lg font-bold text-white">{settings.appName}</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Enterprise email and SMS platform. Simple API, reliable delivery, no SMTP or gateway hassle.
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollTo('features')} className="text-sm text-gray-400 hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollTo('pricing')} className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</button></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><button onClick={() => setModal('terms')} className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</button></li>
                <li><button onClick={() => setModal('privacy')} className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h4>
              <ul className="space-y-2">
                <li>
                  <a href={`mailto:${settings.supportEmail}`} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {settings.supportEmail}
                  </a>
                </li>
                {settings.contactPhone && (
                  <li>
                    <a href={`tel:${settings.contactPhone}`} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {settings.contactPhone}
                    </a>
                  </li>
                )}
                <li className="text-sm text-gray-400">24hr response (Free)</li>
                <li className="text-sm text-gray-400">4hr response (Pro+)</li>
              </ul>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} {settings.appName}. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <button onClick={() => setModal('terms')} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Terms</button>
              <button onClick={() => setModal('privacy')} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacy</button>
            </div>
          </div>
        </div>
      </footer>

      <LegalModal isOpen={modal === 'terms'} onClose={() => setModal(null)} title={legal.terms?.title || 'Terms of Service'}>
        {legal.terms ? (
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {legal.terms.content}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Loading…</p>
        )}
      </LegalModal>

      <LegalModal isOpen={modal === 'privacy'} onClose={() => setModal(null)} title={legal.privacy?.title || 'Privacy Policy'}>
        {legal.privacy ? (
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {legal.privacy.content}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Loading…</p>
        )}
      </LegalModal>
    </>
  );
}

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}