import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight">
          Send Emails From Your App{' '}
          <span className="text-indigo-600">Instantly</span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto">
          Simple API. Reliable Delivery. No SMTP Hassle. HDM BRIDGE handles
          the infrastructure so you can focus on your product.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="btn-primary btn-lg rounded-full px-8 py-4 text-lg"
          >
            Get Started Free
          </Link>
          <a
            href="#features"
            className="btn-secondary btn-lg rounded-full px-8 py-4 text-lg"
          >
            Learn More
          </a>
        </div>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="stat-value text-indigo-600">3,000</div>
            <div className="stat-label">emails free/month</div>
          </div>
          <div className="text-center">
            <div className="stat-value text-indigo-600">API</div>
            <div className="stat-label">keys in seconds</div>
          </div>
          <div className="text-center">
            <div className="stat-value text-indigo-600">Real</div>
            <div className="stat-label">time tracking</div>
          </div>
        </div>
      </div>
    </section>
  );
}