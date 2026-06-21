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
  MapPin
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

  // Stats
  const [stats, setStats] = useState({ total_products: 0, total_coverages: 0, available_coverages: 0 });

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
  const itemsPerPage = 15;

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchCoverages();
      fetchProducts();
    }
  }, [token]);

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
    fetch(`${API_URL}/api/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
        'Authorization': `Bearer ${token}`
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
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async (res) => {
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
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nama_paket: prodName,
        kecepatan: prodSpeed,
        harga: parseInt(prodPrice),
        deskripsi: prodDesc
      })
    })
      .then(async (res) => {
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
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(async (res) => {
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

  // LOGIN GATE SCREEN
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', padding: '24px' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', animation: 'fadeIn 0.4s ease-out' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(126, 40, 123, 0.1)', borderRadius: '9999px', color: '#7E287B', marginBottom: '16px' }}>
              <Lock size={32} />
            </div>
            <h3 style={{ fontSize: '24px', color: '#0f0f12' }}>Admin Sign In</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Masukkan akun administrator MyRepublic Anda.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} /> Username
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
                <Lock size={14} /> Password
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
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Globe size={24} />
          MyR Admin
        </div>
        
        <ul className="sidebar-menu">
          <li>
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`sidebar-item-btn ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              Overview
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('coverage')} 
              className={`sidebar-item-btn ${activeTab === 'coverage' ? 'active' : ''}`}
            >
              <Map size={18} />
              Coverage Area
            </button>
          </li>
          <li>
            <button 
              onClick={() => setActiveTab('products')} 
              className={`sidebar-item-btn ${activeTab === 'products' ? 'active' : ''}`}
            >
              <Package size={18} />
              Paket Produk
            </button>
          </li>
        </ul>

        <div>
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', background: '#7E287B', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>{username}</p>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Administrator</span>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-item-btn" style={{ color: '#ef4444' }}>
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="main-content">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '28px', color: '#0f0f12' }}>Dashboard Overview</h2>
            <p className="text-gray-600">Ringkasan statistik jangkauan dan produk internet Anda saat ini.</p>

            <div className="grid grid-3" style={{ marginTop: '32px' }}>
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>TOTAL WILAYAH</span>
                    <h3 style={{ fontSize: '36px', marginTop: '8px' }}>{stats.total_coverages}</h3>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(126, 40, 123, 0.1)', color: '#7E287B', borderRadius: '12px' }}>
                    <Map size={24} />
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>TERSEDIA</span>
                    <h3 style={{ fontSize: '36px', marginTop: '8px', color: '#10b981' }}>{stats.available_coverages}</h3>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px' }}>
                    <TrendingUp size={24} />
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>PAKET PRODUK</span>
                    <h3 style={{ fontSize: '36px', marginTop: '8px' }}>{stats.total_products}</h3>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '12px' }}>
                    <Package size={24} />
                  </div>
                </div>
              </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '28px', color: '#0f0f12' }}>Manajemen Coverage Area</h2>
                  <p className="text-gray-600">Tambah, ubah, dan hapus area jangkauan kabel fiber optic.</p>
                </div>
                <button onClick={openAddCoverage} className="btn btn-primary" style={{ background: '#7E287B' }}>
                  <Plus size={18} />
                  Tambah Wilayah
                </button>
              </div>

              {/* Search bar */}
              <div style={{ marginTop: '24px', position: 'relative', maxWidth: '400px' }}>
                <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Cari Kabupaten / Kecamatan..." 
                  style={{ paddingLeft: '44px' }}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
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
                            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                              <Check size={14} /> Terpetakan ({parseFloat(cov.latitude).toFixed(4)}, {parseFloat(cov.longitude).toFixed(4)})
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '13px' }}>Batas kosong</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button onClick={() => openEditCoverage(cov)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                              <Edit2 size={12} />
                            </button>
                            <button onClick={() => handleDeleteCoverage(cov.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {paginatedCoverages.length === 0 && (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                          Tidak ada wilayah coverage yang cocok dengan pencarian Anda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  Menampilkan {paginatedCoverages.length} dari {filteredCoverages.length} wilayah
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '13px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                  >
                    Sebelumnya
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: '#374151', padding: '0 8px' }}>
                    Halaman {page} dari {totalPages}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '13px', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* PRODUCT MANAGEMENT TAB */}
        {activeTab === 'products' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '28px', color: '#0f0f12' }}>Manajemen Paket Produk</h2>
                <p className="text-gray-600">Kelola tawaran paket internet fiber optic untuk pelanggan.</p>
              </div>
              <button onClick={openAddProduct} className="btn btn-primary" style={{ background: '#7E287B' }}>
                <Plus size={18} />
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
                        <span style={{ color: '#7E287B', fontWeight: 700 }}>{prod.kecepatan}</span>
                      </td>
                      <td>
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(prod.harga)}
                      </td>
                      <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {prod.deskripsi}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button onClick={() => openEditProduct(prod)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleDeleteProduct(prod.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                            <Trash2 size={12} />
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
      </main>

      {/* COVERAGE MODAL FORM */}
      {showCoverageModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15,15,18,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '24px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', animation: 'fadeIn 0.3s ease-out' }}>
            <h4 style={{ fontSize: '20px', color: '#7E287B', marginBottom: '16px' }}>
              {editingCoverage ? 'Edit Wilayah Coverage' : 'Tambah Wilayah Coverage'}
            </h4>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label className="form-label">Latitude (Manual)</label>
                  <input 
                    type="number" 
                    step="any"
                    className="form-control" 
                    placeholder="Biarkan kosong untuk auto-resolve"
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
                    placeholder="Biarkan kosong untuk auto-resolve"
                    value={covLongitude} 
                    onChange={(e) => setCovLongitude(e.target.value)} 
                  />
                </div>
              </div>

              {osmFeedback && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px', fontSize: '12px', color: '#64748b' }}>
                  <MapPin size={16} color="#7E287B" />
                  <span>{osmFeedback}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                <button type="button" onClick={() => setShowCoverageModal(false)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#7E287B' }} disabled={covLoading}>
                  {covLoading ? (
                    <>
                      <Loader className="animate-spin" size={16} />
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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15,15,18,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '24px' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', animation: 'fadeIn 0.3s ease-out' }}>
            <h4 style={{ fontSize: '20px', color: '#7E287B', marginBottom: '16px' }}>
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

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
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
    </div>
  );
}

export default AdminDashboard;
