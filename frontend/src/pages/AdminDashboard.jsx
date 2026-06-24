import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Map,
  Package,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Globe,
  Search,
  TrendingUp,
  Lock,
  User,
  ArrowLeft,
  Loader,
  Check,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Bell,
  Settings,
  MoreHorizontal,
  Menu,
  X,
  Send,
  ClipboardList,
  FileText,
  Phone,
  Home,
  Eye,
  Mail
} from 'lucide-react';
import { API_URL } from '../App';

function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [username, setUsername] = useState(localStorage.getItem('admin_username') || '');

  // Login fields
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active sub-page tab
  const [activeTab, setActiveTab] = useState('overview');

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState({ total_products: 0, total_coverages: 0, available_coverages: 0, total_registrations: 0, new_registrations: 0 });

  // Registrations
  const [registrations, setRegistrations] = useState([]);
  const [regFilterStatus, setRegFilterStatus] = useState('');
  const [showRegDetailModal, setShowRegDetailModal] = useState(false);
  const [selectedReg, setSelectedReg] = useState(null);
  const [regEditStatus, setRegEditStatus] = useState('');
  const [regEditCatatan, setRegEditCatatan] = useState('');
  const [regSaving, setRegSaving] = useState(false);

  // Data lists
  const [coverages, setCoverages] = useState([]);
  const [products, setProducts] = useState([]);

  // Modals / Form states
  const [showCoverageModal, setShowCoverageModal] = useState(false);
  const [editingCoverage, setEditingCoverage] = useState(null);
  const [covProvinsi, setCovProvinsi] = useState('Lampung');
  const [covKabupaten, setCovKabupaten] = useState('');
  const [covKecamatan, setCovKecamatan] = useState('');
  const [covStatus, setCovStatus] = useState('Belum Tersedia');
  const [covLatitude, setCovLatitude] = useState('');
  const [covLongitude, setCovLongitude] = useState('');
  const [covLoading, setCovLoading] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodSpeed, setProdSpeed] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDesc, setProdDesc] = useState('');

  // OSM Search feedback
  const [osmFeedback, setOsmFeedback] = useState('');

  // Search & Pagination states
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [regSearchQuery, setRegSearchQuery] = useState('');
  const [regCurrentPage, setRegCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    if (latestToken) {
      fetchStats();
      fetchCoverages();
      fetchProducts();
    }
  }, [token]);

  useEffect(() => {
    if (latestToken) {
      fetchRegistrations();
    }
  }, [token, regFilterStatus]);

  const handleUnauthorized = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    setToken('');
    setUsername('');
  };

  const fetchStats = () => {
    fetch(`${API_URL}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  };

  const fetchCoverages = () => {
    fetch(`${API_URL}/api/coverage`)
      .then(res => res.json())
      .then(data => setCoverages(data))
      .catch(err => console.error(err));
  };

  const fetchProducts = () => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err));
  };

  const fetchRegistrations = () => {
    const statusParam = regFilterStatus ? `?status=${regFilterStatus}` : '';
    fetch(`${API_URL}/api/registrations${statusParam}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}` }
    })
      .then(res => {
        if (res.status === 401) {
          handleUnauthorized();
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data) setRegistrations(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error(err));
  };

  const handleUpdateRegStatus = () => {
    if (!selectedReg) return;
    setRegSaving(true);

    fetch(`${API_URL}/api/registrations/${selectedReg.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`
      },
      body: JSON.stringify({ status: regEditStatus, catatan: regEditCatatan }),
    })
      .then(async (res) => {
        if (res.status === 401) {
          handleUnauthorized();
          return;
        }
        if (res.ok) {
          fetchRegistrations();
          fetchStats();
          setShowRegDetailModal(false);
        } else {
          const data = await res.json();
          alert(data.message || 'Gagal mengupdate');
        }
        setRegSaving(false);
      })
      .catch(() => { alert('Gagal menghubungi server'); setRegSaving(false); });
  };

  const handleDeleteReg = (id) => {
    if (!window.confirm('Hapus data pendaftaran ini?')) return;
    fetch(`${API_URL}/api/registrations/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}` }
    })
      .then(async (res) => {
        if (res.status === 401) {
          handleUnauthorized();
          return;
        }
        if (res.ok) { fetchRegistrations(); fetchStats(); }
        else { const d = await res.json(); alert(d.message || 'Gagal menghapus'); }
      })
      .catch(() => alert('Gagal menghubungi server'));
  };

  const openRegDetail = (reg) => {
    setSelectedReg(reg);
    setRegEditStatus(reg.status);
    setRegEditCatatan(reg.catatan || '');
    setShowRegDetailModal(true);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginUser, password: loginPass }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('admin_token', data.token);
          localStorage.setItem('admin_username', data.username);
          setToken(data.token);
          setUsername(data.username);
        } else {
          setLoginError(data.message || 'Login gagal');
        }
        setLoginLoading(false);
      })
      .catch(() => {
        setLoginError('Koneksi ke server API gagal');
        setLoginLoading(false);
      });
  };

  const handleLogout = () => {
    const currentToken = localStorage.getItem('admin_token') || '';
    fetch(`${API_URL}/api/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      }
    }).finally(() => {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_username');
      setToken('');
      setUsername('');
    });
  };

  // Coverage CRUD actions
  const openAddCoverage = () => {
    setEditingCoverage(null);
    setCovProvinsi('Lampung');
    setCovKabupaten('');
    setCovKecamatan('');
    setCovStatus('Belum Tersedia');
    setCovLatitude('');
    setCovLongitude('');
    setOsmFeedback('');
    setShowCoverageModal(true);
  };

  const openEditCoverage = (cov) => {
    setEditingCoverage(cov);
    setCovProvinsi(cov.provinsi);
    setCovKabupaten(cov.kabupaten);
    setCovKecamatan(cov.kecamatan);
    setCovStatus(cov.status);
    setCovLatitude(cov.latitude !== null && cov.latitude !== undefined ? cov.latitude.toString() : '');
    setCovLongitude(cov.longitude !== null && cov.longitude !== undefined ? cov.longitude.toString() : '');
    setOsmFeedback(cov.latitude ? `Koordinat tersimpan: ${cov.latitude}, ${cov.longitude}` : 'Belum memiliki koordinat');
    setShowCoverageModal(true);
  };

  const handleSaveCoverage = (e) => {
    e.preventDefault();
    setCovLoading(true);

    const isEdit = !!editingCoverage;
    const url = isEdit ? `${API_URL}/api/coverage/${editingCoverage.id}` : `${API_URL}/api/coverage`;
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`
      },
      body: JSON.stringify({
        provinsi: covProvinsi,
        kabupaten: covKabupaten,
        kecamatan: covKecamatan,
        status: covStatus,
        latitude: covLatitude !== '' ? parseFloat(covLatitude) : null,
        longitude: covLongitude !== '' ? parseFloat(covLongitude) : null
      })
    })
      .then(async (res) => {
        if (res.status === 401) {
          handleUnauthorized();
          return;
        }
        const data = await res.json();
        if (res.ok) {
          fetchCoverages();
          fetchStats();
          setShowCoverageModal(false);
        } else {
          alert(data.message || 'Gagal menyimpan wilayah');
        }
      })
      .catch(() => alert('Gagal menghubungi server'))
      .finally(() => setCovLoading(false));
  };

  const handleDeleteCoverage = (id) => {
    if (!window.confirm('Hapus wilayah coverage ini?')) return;

    fetch(`${API_URL}/api/coverage/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}` }
    })
      .then(async (res) => {
        if (res.status === 401) {
          handleUnauthorized();
          return;
        }
        if (res.ok) {
          fetchCoverages();
          fetchStats();
        } else {
          const data = await res.json();
          alert(data.message || 'Gagal menghapus');
        }
      })
      .catch(() => alert('Gagal menghubungi server'));
  };

  // Product CRUD actions
  const openAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdSpeed('');
    setProdPrice('');
    setProdDesc('');
    setShowProductModal(true);
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setProdName(prod.nama_paket);
    setProdSpeed(prod.kecepatan);
    setProdPrice(prod.harga);
    setProdDesc(prod.deskripsi);
    setShowProductModal(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    const isEdit = !!editingProduct;
    const url = isEdit ? `${API_URL}/api/products/${editingProduct.id}` : `${API_URL}/api/products`;
    const method = isEdit ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`
      },
      body: JSON.stringify({
        nama_paket: prodName,
        kecepatan: prodSpeed,
        harga: parseInt(prodPrice),
        deskripsi: prodDesc
      })
    })
      .then(async (res) => {
        if (res.status === 401) {
          handleUnauthorized();
          return;
        }
        const data = await res.json();
        if (res.ok) {
          fetchProducts();
          fetchStats();
          setShowProductModal(false);
        } else {
          alert(data.message || 'Gagal menyimpan paket');
        }
      })
      .catch(() => alert('Gagal menghubungi server'));
  };

  const handleDeleteProduct = (id) => {
    if (!window.confirm('Hapus paket produk ini?')) return;

    fetch(`${API_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}` }
    })
      .then(async (res) => {
        if (res.status === 401) {
          handleUnauthorized();
          return;
        }
        if (res.ok) {
          fetchProducts();
          fetchStats();
        } else {
          const data = await res.json();
          alert(data.message || 'Gagal menghapus');
        }
      })
      .catch(() => alert('Gagal menghubungi server'));
  };

  // Tab labels for breadcrumb
  const tabLabels = {
    overview: 'Dashboard',
    coverage: 'Coverage Area',
    products: 'Paket Produk',
    registrations: 'Pendaftaran'
  };

  // LOGIN GATE SCREEN
  const latestToken = localStorage.getItem('admin_token') || '';
  if (!latestToken) {
    return (
      <div className="login-page">
        <div className="login-card animate-fade-in">
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div className="login-icon">
              <Lock size={28} />
            </div>
            <h3 style={{ fontSize: '22px', color: 'var(--dark)', marginBottom: '4px', whiteSpace: 'nowrap' }}>Admin Sign In</h3>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Masukkan akun administrator MyRepublic Anda.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={13} /> Username
              </label>
              <input
                type="text"
                className="form-control"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={13} /> Password
              </label>
              <input
                type="password"
                className="form-control"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                required
              />
            </div>

            {loginError && (
              <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', fontWeight: 600 }}>{loginError}</p>
            )}

            <button type="submit" className="btn btn-primary w-100" style={{ background: '#7E287B' }} disabled={loginLoading}>
              {loginLoading ? 'Memverifikasi...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#7E287B', fontWeight: 600, textDecoration: 'none' }}>
              <ArrowLeft size={14} /> Kembali ke Landing Page
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Top Bar */}
      <div className="mobile-admin-bar">
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logoMyRepublic.png" alt="MyRepublic Logo" style={{ height: '24px', objectFit: 'contain' }} />
        </div>
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ display: 'flex' }}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Overlay (mobile) */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Navigation (Reference Image 1 style) */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--gray-200)', marginBottom: '16px' }}>
          <img src="/logoMyRepublic.png" alt="MyRepublic Logo" style={{ height: '28px', objectFit: 'contain' }} />
        </div>

        <div className="sidebar-section-label">General</div>
        <ul className="sidebar-menu">
          <li>
            <button
              onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
              className={`sidebar-item-btn ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('coverage'); setSidebarOpen(false); }}
              className={`sidebar-item-btn ${activeTab === 'coverage' ? 'active' : ''}`}
            >
              <Map size={18} />
              Coverage Area
              <span className="item-badge">{stats.total_coverages || 0}</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('products'); setSidebarOpen(false); }}
              className={`sidebar-item-btn ${activeTab === 'products' ? 'active' : ''}`}
            >
              <Package size={18} />
              Paket Produk
              <span className="item-badge">{stats.total_products || 0}</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => { setActiveTab('registrations'); setSidebarOpen(false); }}
              className={`sidebar-item-btn ${activeTab === 'registrations' ? 'active' : ''}`}
            >
              <ClipboardList size={18} />
              Pendaftaran
              <span className="item-badge" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>{stats.total_registrations}</span>
              {/* {stats.new_registrations > 0 && (
                <span className="item-badge" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>{stats.new_registrations}</span>
              )} */}
            </button>
          </li>
        </ul>

        {/* Bottom section with user profile */}
        <div style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '16px', marginTop: 'auto' }}>
          <div className="sidebar-section-label" style={{ paddingTop: '0' }}>Profil</div>
          <button className="sidebar-item-btn" style={{ marginBottom: '4px' }}>
            <Settings size={18} />
            Settings
          </button>
          <button onClick={handleLogout} className="sidebar-item-btn" style={{ color: '#ef4444' }}>
            <LogOut size={18} />
            Keluar
          </button>
          <div style={{ margin: '12px 0 0' }}>
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="sidebar-user-info">
                <p>{username}</p>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="main-content">
        {/* Top Header Bar (like reference image 1) */}
        <div className="main-content-header">
          <div className="breadcrumb">
            <a href="#">Pages</a>
            <span className="separator">/</span>
            <span className="current">{tabLabels[activeTab]}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
            <div className="sidebar-user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px', borderRadius: 'var(--radius-full)', cursor: 'pointer', flexShrink: 0 }}>
              {username.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            {/* Promo Banner (like reference image 1) */}
            <div className="promo-banner">
              <div className="promo-text">
                <span className="promo-label">MyRepublic</span>
                <span className="promo-message">Kelola area coverage dan paket internet fiber optic Lampung.</span>
              </div>
              <a href="#" className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                Lihat Landing Page
              </a>
            </div>

            <div className="overview-header">
              <h2>Overview</h2>
            </div>

            {/* Stat Cards Row (4 cards like reference image 1) */}
            <div className="grid grid-3" style={{ marginBottom: '28px' }}>
              <div className="stat-card">
                <div className="stat-label">
                  <div className="stat-icon" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                    <Map size={16} />
                  </div>
                  Total Wilayah
                </div>
                <div className="stat-value">{stats.total_coverages}</div>
                <div className="stat-change positive">
                  <TrendingUp size={12} /> Area terdaftar
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">
                  <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                    <Check size={16} />
                  </div>
                  Tersedia
                </div>
                <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.available_coverages}</div>
                <div className="stat-change positive">
                  <TrendingUp size={12} /> Fiber optic aktif
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">
                  <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                    <Package size={16} />
                  </div>
                  Paket Produk
                </div>
                <div className="stat-value">{stats.total_products}</div>
                <div className="stat-change positive">
                  <TrendingUp size={12} /> Paket aktif
                </div>
              </div>
            </div>

            {/* 4th Stat Card: Registrations */}
            <div className="stat-card">
              <div className="stat-label">
                <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                  <ClipboardList size={16} />
                </div>
                Pendaftaran
              </div>
              <div className="stat-value">{stats.total_registrations}</div>
              {stats.new_registrations > 0 && (
                <div className="stat-change negative">
                  <FileText size={12} /> {stats.new_registrations} baru
                </div>
              )}
            </div>

            {/* Quick data preview - recent coverages */}
            <div className="table-container">
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-200)' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dark)' }}>Data Coverage Terbaru</h4>
                <button
                  onClick={() => setActiveTab('coverage')}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  View All
                </button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Kabupaten</th>
                    <th>Kecamatan</th>
                    <th>Status</th>
                    <th>Koordinat</th>
                  </tr>
                </thead>
                <tbody>
                  {coverages.slice(0, 5).map((cov) => (
                    <tr key={cov.id}>
                      <td style={{ fontWeight: 600 }}>{cov.kabupaten}</td>
                      <td>{cov.kecamatan}</td>
                      <td>
                        <span className={`badge ${cov.status === 'Tersedia' ? 'badge-success' : 'badge-danger'}`}>
                          {cov.status}
                        </span>
                      </td>
                      <td>
                        {cov.latitude ? (
                          <span style={{ color: 'var(--success)', fontSize: '13px', fontWeight: 500 }}>
                            {parseFloat(cov.latitude).toFixed(4)}, {parseFloat(cov.longitude).toFixed(4)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--gray-400)', fontSize: '13px' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Quick preview: Recent Registrations */}
            <div className="table-container" style={{ marginTop: '20px' }}>
              <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--gray-200)' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dark)' }}>Pendaftaran Terbaru</h4>
                <button
                  onClick={() => setActiveTab('registrations')}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  View All
                </button>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Telepon</th>
                    <th>Wilayah</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.slice(0, 5).map((reg) => (
                    <tr key={reg.id}>
                      <td style={{ fontWeight: 600 }}>{reg.nama}</td>
                      <td>{reg.telepon}</td>
                      <td>{reg.kecamatan}, {reg.kabupaten}</td>
                      <td>
                        <span className={`badge ${reg.status === 'Baru' ? 'badge-info' :
                          reg.status === 'Diproses' ? 'badge-warning' :
                            reg.status === 'Selesai' ? 'badge-success' : 'badge-danger'
                          }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                        {new Date(reg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                  {registrations.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '24px' }}>Belum ada data pendaftaran</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COVERAGE MANAGEMENT TAB */}
        {activeTab === 'coverage' && (() => {
          const filteredCoverages = coverages.filter(cov =>
            (cov.kabupaten && cov.kabupaten.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (cov.kecamatan && cov.kecamatan.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (cov.provinsi && cov.provinsi.toLowerCase().includes(searchQuery.toLowerCase()))
          );

          const totalPages = Math.ceil(filteredCoverages.length / itemsPerPage) || 1;
          const page = Math.min(currentPage, totalPages);
          const startIndex = (page - 1) * itemsPerPage;
          const paginatedCoverages = filteredCoverages.slice(startIndex, startIndex + itemsPerPage);

          return (
            <div className="animate-fade-in">
              <div className="action-bar">
                <div>
                  <h2 style={{ fontSize: '22px', color: 'var(--dark)', marginBottom: '4px' }}>Coverage Area</h2>
                  <p style={{ fontSize: '14px', color: 'var(--gray-500)' }}>Tambah, ubah, dan hapus area jangkauan kabel fiber optic.</p>
                </div>
                {/* Search bar */}
                <div className="search-bar" style={{ marginBottom: '4px' }}>
                  <Search className="search-icon" size={16} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cari Kabupaten / Kecamatan..."
                    style={{ paddingLeft: '38px' }}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                {/* <button onClick={openAddCoverage} className="btn btn-primary" style={{ background: '#7E287B' }}>
                  <Plus size={16} />
                  Tambah Wilayah
                </button> */}
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Provinsi</th>
                      <th>Kabupaten / Kota</th>
                      <th>Kecamatan</th>
                      <th>Status</th>
                      <th>Peta / Georef</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCoverages.map((cov) => (
                      <tr key={cov.id}>
                        <td style={{ fontWeight: 600 }}>{cov.provinsi}</td>
                        <td>{cov.kabupaten}</td>
                        <td>{cov.kecamatan}</td>
                        <td>
                          <span className={`badge ${cov.status === 'Tersedia' ? 'badge-success' : 'badge-danger'}`}>
                            {cov.status}
                          </span>
                        </td>
                        <td>
                          {cov.latitude ? (
                            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500 }}>
                              <Check size={13} /> {parseFloat(cov.latitude).toFixed(4)}, {parseFloat(cov.longitude).toFixed(4)}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--gray-400)', fontSize: '13px' }}>Batas kosong</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button onClick={() => openEditCoverage(cov)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                              <Edit2 size={13} />
                            </button>
                            <button onClick={() => handleDeleteCoverage(cov.id)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedCoverages.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
                          Tidak ada wilayah coverage yang cocok dengan pencarian Anda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination (like reference image 1) */}
              <div className="pagination">
                <span className="pagination-info">
                  Menampilkan {paginatedCoverages.length} dari {filteredCoverages.length} wilayah
                </span>
                <div className="pagination-controls">
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(1)}
                    disabled={page === 1}
                  >
                    <ChevronsLeft size={14} />
                  </button>
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="page-info">
                    {page} / {totalPages}
                  </span>
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight size={14} />
                  </button>
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={page === totalPages}
                  >
                    <ChevronsRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* PRODUCT MANAGEMENT TAB */}
        {activeTab === 'products' && (
          <div className="animate-fade-in">
            <div className="action-bar">
              <div>
                <h2 style={{ fontSize: '22px', color: 'var(--dark)', marginBottom: '4px' }}>Paket Produk</h2>
                <p style={{ fontSize: '14px', color: 'var(--gray-500)' }}>Kelola tawaran paket internet fiber optic untuk pelanggan.</p>
              </div>
              <button onClick={openAddProduct} className="btn btn-primary" style={{ background: '#7E287B' }}>
                <Plus size={16} />
                Tambah Paket
              </button>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Paket</th>
                    <th>Kecepatan</th>
                    <th>Harga Bulanan</th>
                    <th>Deskripsi</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod.id}>
                      <td style={{ fontWeight: 600 }}>{prod.nama_paket}</td>
                      <td>
                        <span className="badge badge-primary">{prod.kecepatan}</span>
                      </td>
                      <td>
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(prod.harga)}
                      </td>
                      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prod.deskripsi}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button onClick={() => openEditProduct(prod)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }}>
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDeleteProduct(prod.id)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REGISTRATION MANAGEMENT TAB */}
        {activeTab === 'registrations' && (() => {
          const filteredRegs = registrations.filter(reg =>
            (reg.nama && reg.nama.toLowerCase().includes(regSearchQuery.toLowerCase())) ||
            (reg.telepon && reg.telepon.includes(regSearchQuery)) ||
            (reg.email && reg.email.toLowerCase().includes(regSearchQuery.toLowerCase())) ||
            (reg.alamat && reg.alamat.toLowerCase().includes(regSearchQuery.toLowerCase())) ||
            (reg.kecamatan && reg.kecamatan.toLowerCase().includes(regSearchQuery.toLowerCase())) ||
            (reg.kabupaten && reg.kabupaten.toLowerCase().includes(regSearchQuery.toLowerCase()))
          );

          const totalPages = Math.ceil(filteredRegs.length / itemsPerPage) || 1;
          const page = Math.min(regCurrentPage, totalPages);
          const startIndex = (page - 1) * itemsPerPage;
          const paginatedRegs = filteredRegs.slice(startIndex, startIndex + itemsPerPage);

          return (
            <div className="animate-fade-in">
              <div className="action-bar">
                <div>
                  <h2 style={{ fontSize: '22px', color: 'var(--dark)', marginBottom: '4px' }}>Pendaftaran Calon Pelanggan</h2>
                  <p style={{ fontSize: '14px', color: 'var(--gray-500)' }}>Kelola data calon pelanggan baru dan teruskan ke tim sales.</p>
                </div>
              </div>

              {/* Filters and Search */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div className="search-bar" style={{ flex: '1 1 300px', maxWidth: '400px', margin: 0 }}>
                  <Search className="search-icon" size={16} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Cari nama, telepon, alamat..."
                    style={{ paddingLeft: '38px' }}
                    value={regSearchQuery}
                    onChange={(e) => {
                      setRegSearchQuery(e.target.value);
                      setRegCurrentPage(1);
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-600)' }}>Status:</span>
                  <select
                    className="form-control"
                    style={{ width: '150px', padding: '6px 12px', fontSize: '13px' }}
                    value={regFilterStatus}
                    onChange={(e) => {
                      setRegFilterStatus(e.target.value);
                      setRegCurrentPage(1);
                    }}
                  >
                    <option value="">Semua</option>
                    <option value="Baru">Baru</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nama</th>
                      <th>Telepon</th>
                      <th>Email</th>
                      <th>Wilayah</th>
                      <th>Paket Pilihan</th>
                      <th>Status</th>
                      <th>Tanggal</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRegs.map((reg) => (
                      <tr key={reg.id}>
                        <td style={{ fontWeight: 600 }}>{reg.nama}</td>
                        <td>
                          <a href={`tel:${reg.telepon}`} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={13} color="var(--primary)" /> {reg.telepon}
                          </a>
                        </td>
                        <td>
                          <a href={`mailto:${reg.email}`} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={13} color="var(--primary)" /> {reg.email}
                          </a>
                        </td>
                        <td>
                          <div style={{ fontWeight: 500 }}>{reg.kecamatan}</div>
                          <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{reg.kabupaten}</span>
                        </td>
                        <td>
                          {reg.product ? (
                            <div>
                              <div style={{ fontWeight: 600, color: '#7E287B' }}>{reg.product.nama_paket}</div>
                              <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{reg.product.kecepatan}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--gray-400)', fontSize: '13px' }}>—</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${reg.status === 'Baru' ? 'badge-info' :
                            reg.status === 'Diproses' ? 'badge-warning' :
                              reg.status === 'Selesai' ? 'badge-success' : 'badge-danger'
                            }`}>
                            {reg.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                          {new Date(reg.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button onClick={() => openRegDetail(reg)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Eye size={13} /> Detail
                            </button>
                            <button onClick={() => handleDeleteReg(reg.id)} className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedRegs.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-500)' }}>
                          Tidak ada data pendaftaran yang cocok.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination">
                <span className="pagination-info">
                  Menampilkan {paginatedRegs.length} dari {filteredRegs.length} pendaftaran
                </span>
                <div className="pagination-controls">
                  <button
                    className="page-btn"
                    onClick={() => setRegCurrentPage(1)}
                    disabled={page === 1}
                  >
                    <ChevronsLeft size={14} />
                  </button>
                  <button
                    className="page-btn"
                    onClick={() => setRegCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="page-info">
                    {page} / {totalPages}
                  </span>
                  <button
                    className="page-btn"
                    onClick={() => setRegCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight size={14} />
                  </button>
                  <button
                    className="page-btn"
                    onClick={() => setRegCurrentPage(totalPages)}
                    disabled={page === totalPages}
                  >
                    <ChevronsRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </main>

      {/* COVERAGE MODAL FORM */}
      {showCoverageModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h4>
              {editingCoverage ? 'Edit Wilayah Coverage' : 'Tambah Wilayah Coverage'}
            </h4>
            <p className="modal-desc">
              Masukkan detail wilayah administratif. Koordinat spasial (lat, lon, polygon) akan dicari otomatis dari server OpenStreetMap saat disimpan.
            </p>

            <form onSubmit={handleSaveCoverage}>
              <div className="form-group">
                <label className="form-label">Provinsi</label>
                <input
                  type="text"
                  className="form-control"
                  value={covProvinsi}
                  onChange={(e) => setCovProvinsi(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kabupaten / Kota</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="cth: Bandar Lampung"
                  value={covKabupaten}
                  onChange={(e) => setCovKabupaten(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kecamatan</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="cth: Kedamaian"
                  value={covKecamatan}
                  onChange={(e) => setCovKecamatan(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status Jaringan</label>
                <select
                  className="form-control"
                  value={covStatus}
                  onChange={(e) => setCovStatus(e.target.value)}
                >
                  <option value="Belum Tersedia">Belum Tersedia</option>
                  <option value="Tersedia">Tersedia</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">Latitude (Manual)</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    placeholder="Auto-resolve"
                    value={covLatitude}
                    onChange={(e) => setCovLatitude(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label">Longitude (Manual)</label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    placeholder="Auto-resolve"
                    value={covLongitude}
                    onChange={(e) => setCovLongitude(e.target.value)}
                  />
                </div>
              </div>

              {osmFeedback && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--gray-50)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)', marginBottom: '16px', fontSize: '12px', color: 'var(--gray-600)' }}>
                  <MapPin size={14} color="#7E287B" />
                  <span>{osmFeedback}</span>
                </div>
              )}

              <div className="modal-actions">
                <button type="button" onClick={() => setShowCoverageModal(false)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#7E287B' }} disabled={covLoading}>
                  {covLoading ? (
                    <>
                      <Loader className="animate-spin" size={14} />
                      Mencari Georef OSM...
                    </>
                  ) : 'Simpan Wilayah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL FORM */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h4>
              {editingProduct ? 'Edit Paket Produk' : 'Tambah Paket Produk'}
            </h4>

            <form onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label className="form-label">Nama Paket</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="cth: Value 30"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Kecepatan</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="cth: 30 Mbps"
                  value={prodSpeed}
                  onChange={(e) => setProdSpeed(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Harga Bulanan (IDR)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="cth: 329000"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Deskripsi</label>
                <textarea
                  className="form-control"
                  placeholder="Deskripsi spesifikasi paket..."
                  rows="3"
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowProductModal(false)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#7E287B' }}>
                  Simpan Paket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTRATION DETAIL MODAL */}
      {showRegDetailModal && selectedReg && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--gray-200)', paddingBottom: '12px' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardList size={20} color="#7E287B" />
                Detail Pendaftaran Calon Pelanggan
              </h4>
              <button
                onClick={() => setShowRegDetailModal(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--gray-500)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--gray-500)', display: 'block' }}>Nama Lengkap</span>
                <strong style={{ fontSize: '15px', color: 'var(--dark)' }}>{selectedReg.nama}</strong>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--gray-500)', display: 'block' }}>Nomor Telepon / WhatsApp</span>
                <strong style={{ fontSize: '15px', color: 'var(--dark)' }}>{selectedReg.telepon}</strong>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--gray-500)', display: 'block' }}>Email</span>
                <strong style={{ fontSize: '15px', color: 'var(--dark)' }}>{selectedReg.email}</strong>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '12px', color: 'var(--gray-500)', display: 'block' }}>Alamat Lengkap</span>
                <span style={{ fontSize: '14px', color: 'var(--dark)' }}>{selectedReg.alamat}</span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--gray-500)', display: 'block' }}>Kecamatan</span>
                <span style={{ fontSize: '14px', color: 'var(--dark)', fontWeight: 500 }}>{selectedReg.kecamatan}</span>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--gray-500)', display: 'block' }}>Kabupaten</span>
                <span style={{ fontSize: '14px', color: 'var(--dark)', fontWeight: 500 }}>{selectedReg.kabupaten}</span>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ fontSize: '12px', color: 'var(--gray-500)', display: 'block' }}>Paket Pilihan</span>
                {selectedReg.product ? (
                  <div style={{ background: 'var(--gray-50)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--gray-200)', marginTop: '4px' }}>
                    <strong style={{ color: '#7E287B' }}>{selectedReg.product.nama_paket}</strong> ({selectedReg.product.kecepatan})
                    <div style={{ fontSize: '13px', color: 'var(--gray-600)', marginTop: '2px' }}>
                      Harga: Rp {Number(selectedReg.product.harga).toLocaleString('id-ID')}/bulan
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: '14px', color: 'var(--gray-500)' }}>Tidak ada paket yang dipilih secara spesifik</span>
                )}
              </div>

              <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '8px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--gray-500)', display: 'block', marginBottom: '6px' }}>Foto Rumah</span>
                  {selectedReg.foto_rumah ? (
                    <a href={`${API_URL}/${selectedReg.foto_rumah}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                      <img
                        src={`${API_URL}/${selectedReg.foto_rumah}`}
                        alt="Foto Rumah"
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--gray-200)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    </a>
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '120px',
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px dashed var(--gray-300)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gray-400)',
                      fontSize: '13px'
                    }}>
                      Tidak diunggah
                    </div>
                  )}
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--gray-500)', display: 'block', marginBottom: '6px' }}>Foto KTP</span>
                  {selectedReg.foto_ktp ? (
                    <a href={`${API_URL}/${selectedReg.foto_ktp}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                      <img
                        src={`${API_URL}/${selectedReg.foto_ktp}`}
                        alt="Foto KTP"
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--gray-200)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    </a>
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '120px',
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px dashed var(--gray-300)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gray-400)',
                      fontSize: '13px'
                    }}>
                      Tidak diunggah
                    </div>
                  )}
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--gray-500)', display: 'block', marginBottom: '6px' }}>Foto Meteran</span>
                  {selectedReg.foto_meteran ? (
                    <a href={`${API_URL}/${selectedReg.foto_meteran}`} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                      <img
                        src={`${API_URL}/${selectedReg.foto_meteran}`}
                        alt="Foto Meteran"
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--gray-200)',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    </a>
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '120px',
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px dashed var(--gray-300)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--gray-400)',
                      fontSize: '13px'
                    }}>
                      Tidak diunggah
                    </div>
                  )}
                </div>
              </div>
            </div>

            <hr style={{ border: 0, borderTop: '1px solid var(--gray-200)', margin: '20px 0' }} />

            <h5 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>Tindakan Administrator</h5>

            <form onSubmit={(e) => { e.preventDefault(); handleUpdateRegStatus(); }}>
              <div className="form-group">
                <label className="form-label">Status Tindak Lanjut</label>
                <select
                  className="form-control"
                  value={regEditStatus}
                  onChange={(e) => setRegEditStatus(e.target.value)}
                  required
                >
                  <option value="Baru">Baru (Belum diproses)</option>
                  <option value="Diproses">Diproses (Survei lokasi/hubungi sales)</option>
                  <option value="Selesai">Selesai (Sudah terpasang)</option>
                  <option value="Ditolak">Ditolak (Batal/tidak tercover detail)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Catatan Internal / Riwayat Survei</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Masukkan catatan perkembangan pemasangan atau alasan penolakan..."
                  value={regEditCatatan}
                  onChange={(e) => setRegEditCatatan(e.target.value)}
                />
              </div>

              {/* WhatsApp Link Shortcuts */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <a
                  href={`https://wa.me/${selectedReg.telepon.replace(/[^0-9]/g, '').replace(/^0/, '62')}?text=${encodeURIComponent(
                    `Halo ${selectedReg.nama}, kami dari MyRepublic Lampung ingin mengonfirmasi pendaftaran pasang baru internet Anda di alamat: ${selectedReg.alamat}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ flex: 1, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', borderColor: '#25D366', color: '#25D366' }}
                >
                  <Phone size={14} /> Hubungi Pelanggan (WA)
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `*INFO CALON PELANGGAN BARU - MYREPUBLIC LAMPUNG*\n\nNama: ${selectedReg.nama}\nTelepon: ${selectedReg.telepon}\nAlamat: ${selectedReg.alamat}\nKecamatan: ${selectedReg.kecamatan}\nKabupaten: ${selectedReg.kabupaten}\nPaket Pilihan: ${selectedReg.product ? `${selectedReg.product.nama_paket} (${selectedReg.product.kecepatan})` : 'Pilih nanti'}\n\nMohon ditindaklanjuti untuk survei lokasi dan pemasangan.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ flex: 1, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', borderColor: '#7E287B', color: '#7E287B' }}
                >
                  <Send size={14} /> Teruskan ke Sales (WA)
                </a>
              </div>

              <div className="modal-actions" style={{ borderTop: '1px solid var(--gray-200)', paddingTop: '16px', marginTop: '0' }}>
                <button type="button" onClick={() => setShowRegDetailModal(false)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#7E287B' }} disabled={regSaving}>
                  {regSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
