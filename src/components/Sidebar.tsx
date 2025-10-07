import './Sidebar.css';

interface NavItem {
  icon: string;
  isActive?: boolean;
}

const Sidebar: React.FC = () => {
  const mainNavItems: NavItem[] = [
    { icon: 'home', isActive: true },
    { icon: 'folder' },
    { icon: 'view_kanban' },
    { icon: 'contacts' },
    { icon: 'dashboard' },
  ];

  const bottomNavItems: NavItem[] = [
    { icon: 'filter_list' },
    { icon: 'lock' },
    { icon: 'admin_panel_settings' },
    { icon: 'help_outline' },
  ];

  return (
    <div className="sidebar" data-state="Collapsed">
      {/* Logo/Brand Section */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-dot"></div>
          <div className="logo-line-long"></div>
          <div className="logo-line-short"></div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="nav-section">
        {mainNavItems.map((item, index) => (
          <div
            key={index}
            className={`nav-item ${item.isActive ? 'active' : 'default'}`}
            data-property-1={item.isActive ? 'Active' : 'Default'}
          >
            <div className="nav-item-content">
              <div className={`nav-icon ${!item.isActive ? 'inactive' : ''}`}>
                {item.icon}
              </div>
              <div className="expand-icon">expand_more</div>
            </div>
            {item.isActive && <div className="active-indicator"></div>}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="nav-divider"></div>

      {/* Bottom Navigation */}
      <div className="nav-section">
        {bottomNavItems.map((item, index) => (
          <div
            key={index}
            className="nav-item default"
            data-property-1="Default"
          >
            <div className="nav-item-content">
              <div className="nav-icon inactive">{item.icon}</div>
              <div className="expand-icon">expand_more</div>
            </div>
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div className="sidebar-spacer"></div>

      {/* User Profile */}
      <div className="user-profile">
        <img
          className="user-avatar"
          src="https://placehold.co/42x42"
          alt="User Avatar"
          data-name="Jacky"
          data-size="48px"
        />
      </div>
    </div>
  );
};

export default Sidebar;