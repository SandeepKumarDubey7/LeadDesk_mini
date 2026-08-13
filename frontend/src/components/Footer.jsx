/**
 * Footer component with GALLANTT ISPAT LIMITED attribution and social links.
 */

function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/icon.jpg" alt="LeadDesk Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
              <span className="text-lg font-bold text-white">
                Lead<span className="text-primary-light">Desk</span> Mini
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              A modern lead capture and management platform. Streamline your sales pipeline with powerful tools.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#hero" className="text-sm hover:text-primary-light transition-colors">Home</a></li>
              <li><a href="#features" className="text-sm hover:text-primary-light transition-colors">Features</a></li>
              <li><a href="#about" className="text-sm hover:text-primary-light transition-colors">About</a></li>
              <li><a href="#contact" className="text-sm hover:text-primary-light transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Get in Touch</h4>
            <ul className="space-y-2">
              <li className="text-sm">📧 sandeepdk180@gmail.com</li>
              <li className="text-sm">📍 India</li>
              <li>
                <span className="text-sm text-primary-light">
                  🏢 GALLANTT ISPAT LIMITED
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} LeadDesk Mini. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Built for{' '}
            <span className="text-primary-light font-medium">
              GALLANTT ISPAT LIMITED
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
