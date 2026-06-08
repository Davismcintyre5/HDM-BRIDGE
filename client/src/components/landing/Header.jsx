import { Link } from 'react-router-dom';
import Logo from './Logo';
import NavLinks from './NavLinks';
import AuthButtons from './AuthButtons';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo />
          <NavLinks />
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}