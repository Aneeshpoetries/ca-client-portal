import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { RiLogoutBoxLine, RiUser3Line, RiMenuLine, RiCloseLine, RiArrowDownSLine } from 'react-icons/ri';

// ── Nav link definitions ──────────────────────────────────────────────────────
// Types:
//   { to, label }                   — direct link
//   { label, children: [...] }      — simple dropdown (flat list)
//   { label, sections: [{heading, children}] } — two-column mega-menu

const caLinks = [
  { to: '/dashboard',     label: 'Home' },
  { to: '/clients',       label: 'Clients' },
  {
    label: 'Documents',
    sections: [
      {
        heading: 'Shared by Us',
        children: [
          { to: '/documents?primary=shared_by_us',                          label: 'All'          },
          { to: '/documents?primary=shared_by_us&category=gst_return',      label: 'GST Returns'  },
          { to: '/documents?primary=shared_by_us&category=itr',             label: 'ITR Files'    },
          { to: '/documents?primary=shared_by_us&category=client_document', label: 'Client Files' },
          { to: '/documents?primary=shared_by_us&category=other_return',    label: 'Other Returns'},
        ],
      },
      {
        heading: 'From Clients',
        children: [
          { to: '/documents?primary=from_clients',                           label: 'All'          },
          { to: '/documents?primary=from_clients&category=gst_return',       label: 'GST Returns'  },
          { to: '/documents?primary=from_clients&category=itr',              label: 'ITR Files'    },
          { to: '/documents?primary=from_clients&category=client_document',  label: 'Client Files' },
          { to: '/documents?primary=from_clients&category=other_return',     label: 'Other Returns'},
        ],
      },
    ],
  },
  { to: '/announcements', label: 'Announcements' },
  { to: '/users',         label: 'Staff' },
];

const staffLinks = [
  { to: '/dashboard', label: 'Home' },
  { to: '/clients',   label: 'My Clients' },
  {
    label: 'Uploads',
    sections: [
      {
        heading: 'Shared by Us',
        children: [
          { to: '/documents?primary=shared_by_us',                          label: 'All'          },
          { to: '/documents?primary=shared_by_us&category=gst_return',      label: 'GST Returns'  },
          { to: '/documents?primary=shared_by_us&category=itr',             label: 'ITR Files'    },
          { to: '/documents?primary=shared_by_us&category=client_document', label: 'Client Files' },
        ],
      },
      {
        heading: 'From Clients',
        children: [
          { to: '/documents?primary=from_clients',                           label: 'All'          },
          { to: '/documents?primary=from_clients&category=gst_return',       label: 'GST Returns'  },
          { to: '/documents?primary=from_clients&category=itr',              label: 'ITR Files'    },
          { to: '/documents?primary=from_clients&category=client_document',  label: 'Client Files' },
        ],
      },
    ],
  },
  { to: '/announcements', label: 'Announcements' },
];

const clientLinks = [
  {
    label: 'My Portal',
    sections: [
      {
        heading: 'My Uploads',
        children: [
          { to: '/portal?primary=my_uploads',                              label: 'All Files'    },
          { to: '/portal?primary=my_uploads&sub=gst_return',              label: 'GST Returns'  },
          { to: '/portal?primary=my_uploads&sub=itr',                     label: 'ITR'          },
          { to: '/portal?primary=my_uploads&sub=client_document',         label: 'Documents'    },
          { to: '/portal?primary=my_uploads&sub=other_return',            label: 'Other Returns'},
        ],
      },
      {
        heading: 'From CA',
        children: [
          { to: '/portal?primary=from_ca',                                label: 'All Files'    },
          { to: '/portal?primary=from_ca&sub=gst_return',                 label: 'GST Returns'  },
          { to: '/portal?primary=from_ca&sub=itr',                        label: 'ITR'          },
          { to: '/portal?primary=from_ca&sub=client_document',            label: 'Documents'    },
          { to: '/portal?primary=from_ca&sub=other_return',               label: 'Other Returns'},
        ],
      },
    ],
  },
  { to: '/announcements', label: 'Updates' },
];

// ── Sidebar component ─────────────────────────────────────────────────────────
export default function Sidebar() {
  const { user, logout, isCA, isClient } = useAuth();
  const navigate = useNavigate();
  const links = isClient ? clientLinks : (isCA ? caLinks : staffLinks);

  const [userOpen,     setUserOpen]     = useState(false);
  const [navDropdown,  setNavDropdown]  = useState(null);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [mobileAccord, setMobileAccord] = useState(null);

  const userRef = useRef(null);
  const navRef  = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
      if (navRef.current  && !navRef.current.contains(e.target))  setNavDropdown(null);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); toast.success('Signed out'); }
    catch { toast.error('Logout failed'); }
  };

  // ── Desktop nav item renderer ─────────────────────────────────────────────
  const renderDesktopLink = (link) => {
    // Sectioned mega-menu
    if (link.sections) {
      const open = navDropdown === link.label;
      return (
        <div key={link.label} className="relative">
          <button
            onClick={() => setNavDropdown(v => v === link.label ? null : link.label)}
            className={`nav-link flex items-center gap-1 ${open ? 'active' : ''}`}
          >
            {link.label}
            <RiArrowDownSLine className={`text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.13 }}
                className="absolute top-full mt-2 left-0 bg-white rounded-2xl py-3 z-50 min-w-[300px]"
                style={{ border: '1px solid #e2e8f0', boxShadow: '0 10px 24px -4px rgba(15,23,42,0.12), 0 4px 8px -2px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.04)' }}
              >
                <div className={`grid divide-x divide-gray-100 ${link.sections.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {link.sections.map(section => (
                    <div key={section.heading} className="px-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 mb-1.5">
                        {section.heading}
                      </p>
                      {section.children.map(child => (
                        <NavLink
                          key={child.to}
                          to={child.to}
                          onClick={() => setNavDropdown(null)}
                          className={({ isActive }) =>
                            `block px-2 py-1.5 text-sm rounded-lg transition-colors hover:bg-gray-50 ${
                              isActive ? 'text-gray-900 font-semibold bg-gray-50' : 'text-gray-600'
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Simple dropdown (flat list)
    if (link.children) {
      const open = navDropdown === link.label;
      return (
        <div key={link.label} className="relative">
          <button
            onClick={() => setNavDropdown(v => v === link.label ? null : link.label)}
            className={`nav-link flex items-center gap-1 ${open ? 'active' : ''}`}
          >
            {link.label}
            <RiArrowDownSLine className={`text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                transition={{ duration: 0.13 }}
                className="absolute top-full mt-2 left-0 w-48 bg-white rounded-xl py-1.5 z-50"
                style={{ border: '1px solid #e2e8f0', boxShadow: '0 10px 24px -4px rgba(15,23,42,0.12), 0 4px 8px -2px rgba(15,23,42,0.06)' }}
              >
                {link.children.map(child => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    onClick={() => setNavDropdown(null)}
                    className={({ isActive }) =>
                      `block px-3.5 py-2 text-sm transition-colors hover:bg-gray-50 ${
                        isActive ? 'text-gray-900 font-semibold bg-gray-50' : 'text-gray-600'
                      }`
                    }
                  >
                    {child.label}
                  </NavLink>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Direct link
    return (
      <NavLink
        key={link.to}
        to={link.to}
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
      >
        {link.label}
      </NavLink>
    );
  };

  // ── Mobile nav item renderer ──────────────────────────────────────────────
  const renderMobileLink = (link) => {
    // Sectioned accordion
    if (link.sections) {
      const open = mobileAccord === link.label;
      return (
        <div key={link.label}>
          <button
            onClick={() => setMobileAccord(v => v === link.label ? null : link.label)}
            className="nav-link w-full flex items-center justify-between"
          >
            <span>{link.label}</span>
            <RiArrowDownSLine className={`text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                {link.sections.map(section => (
                  <div key={section.heading} className="pl-3 border-l-2 border-gray-100 ml-2 mt-1 mb-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 pt-1 pb-1">
                      {section.heading}
                    </p>
                    {section.children.map(child => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        onClick={() => { setMobileOpen(false); setMobileAccord(null); }}
                        className={({ isActive }) => `nav-link text-sm ${isActive ? 'active' : ''}`}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Simple accordion
    if (link.children) {
      const open = mobileAccord === link.label;
      return (
        <div key={link.label}>
          <button
            onClick={() => setMobileAccord(v => v === link.label ? null : link.label)}
            className="nav-link w-full flex items-center justify-between"
          >
            <span>{link.label}</span>
            <RiArrowDownSLine className={`text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden pl-3 border-l-2 border-gray-100 ml-2 mt-0.5 mb-1"
              >
                {link.children.map(child => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    onClick={() => { setMobileOpen(false); setMobileAccord(null); }}
                    className={({ isActive }) => `nav-link text-sm ${isActive ? 'active' : ''}`}
                  >
                    {child.label}
                  </NavLink>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Direct link
    return (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={() => setMobileOpen(false)}
        className={({ isActive }) => `nav-link w-full ${isActive ? 'active' : ''}`}
      >
        {link.label}
      </NavLink>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b"
      style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderColor: '#e2e8f0' }}>
      <div className="max-w-screen-xl mx-auto px-6 h-[54px] flex items-center gap-6">

        {/* Brand */}
        <NavLink to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0 mr-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
            <span className="text-white text-[11px] font-extrabold tracking-tight">CA</span>
          </div>
          <span className="font-bold text-gray-900 text-[15px] tracking-tight">Portal</span>
        </NavLink>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1" ref={navRef}>
          {links.map(renderDesktopLink)}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-3">

          {/* User dropdown */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserOpen(v => !v)}
              className="flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <div className="avatar w-6 h-6 text-[11px]">{user?.name?.charAt(0).toUpperCase()}</div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[110px] truncate">{user?.name}</span>
              <RiArrowDownSLine className={`text-gray-400 text-xs transition-transform ${userOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {userOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl py-1.5 z-50"
                  style={{ border: '1px solid #e2e8f0', boxShadow: '0 10px 24px -4px rgba(15,23,42,0.12), 0 4px 8px -2px rgba(15,23,42,0.06)' }}
                >
                  <div className="px-3.5 py-2.5 border-b border-gray-50">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                    <p className="text-[11px] text-indigo-500 font-medium mt-1">
                      {isCA ? 'Chartered Accountant' : isClient ? 'Client' : 'Staff Member'}
                    </p>
                  </div>
                  <NavLink to="/profile" onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <RiUser3Line className="text-gray-400" /> Profile &amp; settings
                  </NavLink>
                  <div className="border-t border-gray-50 mt-0.5 pt-0.5">
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <RiLogoutBoxLine /> Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <RiCloseLine className="text-lg" /> : <RiMenuLine className="text-lg" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="md:hidden overflow-hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 py-2 space-y-0.5">
              {links.map(renderMobileLink)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
