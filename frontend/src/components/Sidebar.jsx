import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import {
  RiLogoutBoxLine, RiUser3Line, RiMenuLine, RiCloseLine,
  RiArrowDownSLine, RiSunLine, RiMoonLine,
} from 'react-icons/ri';

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
          { to: '/portal?primary=my_uploads',                              label: 'All'          },
          { to: '/portal?primary=my_uploads&sub=gst_return',              label: 'GST Returns'  },
          { to: '/portal?primary=my_uploads&sub=itr',                     label: 'ITR Files'    },
          { to: '/portal?primary=my_uploads&sub=client_document',         label: 'Client Files' },
          { to: '/portal?primary=my_uploads&sub=other_return',            label: 'Other Returns'},
        ],
      },
      {
        heading: 'From CA',
        children: [
          { to: '/portal?primary=from_ca',                                label: 'All'          },
          { to: '/portal?primary=from_ca&sub=gst_return',                 label: 'GST Returns'  },
          { to: '/portal?primary=from_ca&sub=itr',                        label: 'ITR Files'    },
          { to: '/portal?primary=from_ca&sub=client_document',            label: 'Client Files' },
          { to: '/portal?primary=from_ca&sub=other_return',               label: 'Other Returns'},
        ],
      },
    ],
  },
  { to: '/announcements', label: 'Updates' },
];

export default function Sidebar() {
  const { user, logout, isCA, isClient } = useAuth();
  const { isDark, toggle }               = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const links = isClient ? clientLinks : (isCA ? caLinks : staffLinks);

  const isChildActive = (to) => {
    const [p, q] = to.split('?');
    return location.pathname === p && location.search === (q ? '?' + q : '');
  };

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
    try { await logout(); navigate('/'); toast.success('Signed out'); }
    catch { toast.error('Logout failed'); }
  };

  const S = {
    header: isDark
      ? { background: 'rgba(7,16,26,0.88)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(30,48,72,0.70)', boxShadow: '0 1px 0 rgba(32,184,154,0.07), 0 4px 16px rgba(0,0,0,0.30)' }
      : { background: 'rgba(255,255,255,0.80)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(32,184,154,0.12)', boxShadow: '0 1px 0 rgba(99,102,241,0.06), 0 4px 16px rgba(0,0,0,0.05)' },

    dropdown: isDark
      ? { background: 'rgba(10,18,32,0.98)', border: '1px solid rgba(30,48,72,0.80)', boxShadow: '0 12px 28px -4px rgba(0,0,0,0.50), 0 4px 10px -2px rgba(0,0,0,0.35)' }
      : { background: 'rgba(252,254,255,0.98)', border: '1px solid rgba(32,184,154,0.15)', boxShadow: '0 12px 28px -4px rgba(32,184,154,0.10), 0 4px 10px -2px rgba(0,0,0,0.06)' },

    navActive: isDark
      ? { color: '#7de8d4', background: '#182820', boxShadow: 'inset 2px 0 0 #20b89a' }
      : { color: '#0a4a3e', fontWeight: '600', boxShadow: 'inset 2px 0 0 #148a74', background: 'rgba(14,92,79,0.06)' },
    navDefault: isDark ? { color: '#b0c0b8' } : { color: '#3d4a44' },
    navHover:   isDark ? 'hover:bg-[#182820]' : 'hover:bg-black/[0.04]',

    sectionHeading: { color: isDark ? '#40c8a8' : '#6ab8a8' },
    brandText:      { color: isDark ? '#20b89a' : '#0e5c4f' },
    dividerBorder:  isDark ? 'rgba(32,184,154,0.10)' : '#f3f4f6',

    panelName:   isDark ? '#ece9e4' : '#111827',
    panelEmail:  isDark ? '#6a8880' : '#9ca3af',
    panelRole:   isDark ? '#40c8a8' : '#6366f1',
    panelLink:   isDark ? 'text-[#b0c0b8] hover:bg-[#1a2c28]' : 'text-gray-700 hover:bg-gray-50',
    panelLogout: isDark ? 'text-red-400 hover:bg-red-950/40' : 'text-red-600 hover:bg-red-50',

    mobileNav:    isDark
      ? { background: 'rgba(7,16,26,0.98)', borderColor: 'rgba(30,48,72,0.70)' }
      : { background: 'rgba(250,252,255,0.97)', borderColor: 'rgba(32,184,154,0.12)' },
    mobileAccordBorder: isDark ? 'border-[#2c3c34]' : 'border-gray-100',
    mobileHeading:      isDark ? 'text-[#40c8a8]' : 'text-gray-400',
    userHover:          isDark ? 'hover:bg-[#182820]' : 'hover:bg-indigo-50',
    mobileHamburger:    isDark ? 'text-gray-400 hover:bg-[#182820]' : 'text-gray-500 hover:bg-gray-100',
    toggleBtn:          isDark ? 'text-[#40c8a8] hover:bg-[#182820]' : 'text-[#0e5c4f] hover:bg-[#d6ede8]',
  };

  const renderDesktopLink = (link) => {
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
                className="absolute top-full mt-2 left-0 rounded-2xl py-3 z-50 min-w-[300px]"
                style={S.dropdown}
              >
                <div className={`grid ${link.sections.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}
                  style={{ borderColor: S.dividerBorder }}>
                  {link.sections.map(section => (
                    <div key={section.heading} className="px-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider px-2 mb-1.5" style={S.sectionHeading}>
                        {section.heading}
                      </p>
                      {section.children.map(child => {
                        const active = isChildActive(child.to);
                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            onClick={() => setNavDropdown(null)}
                            className={`block px-2 py-1.5 text-sm rounded-lg transition-all duration-100 ${active ? '' : S.navHover}`}
                            style={active ? S.navActive : S.navDefault}
                          >
                            {child.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

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
                className="absolute top-full mt-2 left-0 w-48 rounded-xl py-1.5 z-50"
                style={S.dropdown}
              >
                {link.children.map(child => {
                  const active = isChildActive(child.to);
                  return (
                    <NavLink
                      key={child.to}
                      to={child.to}
                      onClick={() => setNavDropdown(null)}
                      className={`block px-3.5 py-2 text-sm transition-all duration-100 ${active ? '' : S.navHover}`}
                      style={active ? S.navActive : S.navDefault}
                    >
                      {child.label}
                    </NavLink>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

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

  const renderMobileLink = (link) => {
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
                  <div key={section.heading} className={`pl-3 border-l-2 ml-2 mt-1 mb-2 ${S.mobileAccordBorder}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider px-2 pt-1 pb-1 ${S.mobileHeading}`}>
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
                className={`overflow-hidden pl-3 border-l-2 ml-2 mt-0.5 mb-1 ${S.mobileAccordBorder}`}
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
    <header className="sticky top-0 z-50" style={S.header}>
      <div className="max-w-screen-xl mx-auto px-6 h-[54px] flex items-center gap-6">

        
        <NavLink to="/dashboard" className="flex items-center gap-2.5 flex-shrink-0 mr-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, #148a74, #0e5c4f)' }}>
            <span className="text-white text-[11px] font-extrabold tracking-tight">CA</span>
          </div>
          <span className="font-bold text-[15px] tracking-tight" style={S.brandText}>Portal</span>
        </NavLink>

        
        <nav className="hidden md:flex items-center gap-0.5 flex-1" ref={navRef}>
          {links.map(renderDesktopLink)}
        </nav>

        
        <div className="ml-auto flex items-center gap-2">

          
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className={`p-1.5 rounded-lg transition-colors ${S.toggleBtn}`}
          >
            {isDark ? <RiSunLine className="text-base" /> : <RiMoonLine className="text-base" />}
          </button>

          
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserOpen(v => !v)}
              className={`flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-full transition-colors ${S.userHover}`}
            >
              <div className="avatar w-6 h-6 text-[11px]">{user?.name?.charAt(0).toUpperCase()}</div>
              <span className="hidden sm:block text-sm font-medium max-w-[110px] truncate" style={S.brandText}>
                {user?.name}
              </span>
              <RiArrowDownSLine className={`text-xs transition-transform ${userOpen ? 'rotate-180' : ''}`} style={{ color: isDark ? '#40c8a8' : '#6ab8a8' }} />
            </button>
            <AnimatePresence>
              {userOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-2 w-52 rounded-xl py-1.5 z-50"
                  style={S.dropdown}
                >
                  <div className="px-3.5 py-2.5" style={{ borderBottom: `1px solid ${S.dividerBorder}` }}>
                    <p className="text-sm font-semibold" style={{ color: S.panelName }}>{user?.name}</p>
                    <p className="text-xs truncate mt-0.5" style={{ color: S.panelEmail }}>{user?.email}</p>
                    <p className="text-[11px] font-medium mt-1" style={{ color: S.panelRole }}>
                      {isCA ? 'Chartered Accountant' : isClient ? 'Client' : 'Staff Member'}
                    </p>
                  </div>
                  <NavLink to="/profile" onClick={() => setUserOpen(false)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors ${S.panelLink}`}>
                    <RiUser3Line className="opacity-60" /> Profile &amp; settings
                  </NavLink>
                  <div style={{ borderTop: `1px solid ${S.dividerBorder}` }} className="mt-0.5 pt-0.5">
                    <button onClick={handleLogout}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors ${S.panelLogout}`}>
                      <RiLogoutBoxLine /> Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          
          <button
            className={`md:hidden p-1.5 rounded-md transition-colors ${S.mobileHamburger}`}
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <RiCloseLine className="text-lg" /> : <RiMenuLine className="text-lg" />}
          </button>
        </div>
      </div>

      
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="md:hidden overflow-hidden border-t"
            style={S.mobileNav}
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
