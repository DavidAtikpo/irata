import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {/* Contact */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-blue-400">Contact</h3>
            <p className="text-sm">IRATA Formation</p>
            <p className="text-sm">Email : contact@irata-formation.com</p>
            <p className="text-sm">Tél : +33 1 23 45 67 89</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-blue-400">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/formations" className="hover:text-blue-400 transition-colors">
                  Nos Formations
                </Link>
              </li>
              <li>
                <Link href="/demande" className="hover:text-blue-400 transition-colors">
                  Faire une demande
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-blue-400">Informations légales</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/mentions-legales" className="hover:text-blue-400 transition-colors">
                  Mentions Légales
                </Link>
              </li>
              <li>
                <Link href="/politique-confidentialite" className="hover:text-blue-400 transition-colors">
                  Politique de Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/cgv" className="hover:text-blue-400 transition-colors">
                  CGV
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} IRATA Formation. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
