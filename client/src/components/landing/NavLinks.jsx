export default function NavLinks() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="hidden md:flex items-center space-x-8">
      <button onClick={() => scrollTo('features')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
        Features
      </button>
      <button onClick={() => scrollTo('pricing')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
        Pricing
      </button>
      <button onClick={() => scrollTo('contact')} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
        Contact
      </button>
    </nav>
  );
}