import { useState, useEffect } from 'react';
import LegalModal from './LegalModal';

export default function Footer() {
  const [modal, setModal] = useState(null);
  const [settings, setSettings] = useState({
    supportEmail: 'support@hdmbridge.com',
    contactPhone: '',
    appName: 'HDM BRIDGE',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${API_URL.replace('/api', '')}/admin/api/system/public`);
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings({
          supportEmail: data.settings.support_email || settings.supportEmail,
          contactPhone: data.settings.contact_phone || '',
          appName: data.settings.app_name || settings.appName,
        });
      }
    } catch {
      // Use defaults
    }
  };

  return (
    <>
      <footer id="contact" className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <span className="text-lg font-bold text-white">{settings.appName}</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Enterprise email sending platform. Simple API, reliable delivery, no SMTP hassle.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2">
                <li><button onClick={() => scrollTo('features')} className="text-sm text-gray-400 hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollTo('pricing')} className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</button></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><button onClick={() => setModal('terms')} className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</button></li>
                <li><button onClick={() => setModal('privacy')} className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</button></li>
              </ul>
            </div>

            {/* Contact */}
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

          {/* Bottom bar */}
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

      <LegalModal isOpen={modal === 'terms'} onClose={() => setModal(null)} title="Terms of Service">
        <h4 className="font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h4>
        <p className="mb-4">By accessing and using {settings.appName}, you agree to be bound by these Terms of Service.</p>
        <h4 className="font-semibold text-gray-900 mb-2">2. Description of Service</h4>
        <p className="mb-4">{settings.appName} provides an email sending platform for transactional and marketing emails via API or SMTP.</p>
        <h4 className="font-semibold text-gray-900 mb-2">3. User Obligations</h4>
        <p className="mb-4">You agree to use the service in compliance with all applicable laws and regulations.</p>
        <h4 className="font-semibold text-gray-900 mb-2">4. Prohibited Activities</h4>
        <p className="mb-4">You may not use the service for spam, phishing, or any illegal activities.</p>
        <h4 className="font-semibold text-gray-900 mb-2">5. Limitation of Liability</h4>
        <p>{settings.appName} is provided "as is" without any warranties.</p>
      </LegalModal>

      <LegalModal isOpen={modal === 'privacy'} onClose={() => setModal(null)} title="Privacy Policy">
        <h4 className="font-semibold text-gray-900 mb-2">1. Information Collection</h4>
        <p className="mb-4">We collect information necessary to provide our email sending services.</p>
        <h4 className="font-semibold text-gray-900 mb-2">2. Use of Information</h4>
        <p className="mb-4">Your data is used solely for providing and improving our services.</p>
        <h4 className="font-semibold text-gray-900 mb-2">3. Data Protection</h4>
        <p className="mb-4">We implement security measures including encryption and secure access controls.</p>
        <h4 className="font-semibold text-gray-900 mb-2">4. Your Rights</h4>
        <p>You have the right to access, correct, or delete your data at any time.</p>
      </LegalModal>
    </>
  );
}

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}