import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { MapPin, Search, Compass, Shield, Wifi, Zap, CheckCircle, XCircle, ArrowRight, Laptop, Star, Menu, X, Send, UserPlus, Phone, Home, Camera } from 'lucide-react';
import { API_URL } from '../App';
import L from 'leaflet';

ChartJS.register(ArcElement, Tooltip, Legend);

// Fix Leaflet marker icon issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A helper component to programmatically pan/zoom the map
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

function LandingPage() {
  const [products, setProducts] = useState([]);
  const [coverages, setCoverages] = useState([]);
  const [lampungGeoJson, setLampungGeoJson] = useState(null);

  // Geolocation states
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [geoResult, setGeoResult] = useState(null); // { status: 'Tersedia'|'Belum Tersedia', kabupaten, kecamatan }

  // Manual check form
  const [manualKab, setManualKab] = useState('');
  const [manualKec, setManualKec] = useState('');

  // Map control states
  const [mapCenter, setMapCenter] = useState([-4.976, 105.037]); // Lampung coordinates
  const [mapZoom, setMapZoom] = useState(8.5);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Registration form states
  const [showRegForm, setShowRegForm] = useState(false);
  const [regForm, setRegForm] = useState({ nama: '', telepon: '', alamat: '', paket_id: '' });
  const [fotoRumah, setFotoRumah] = useState(null);
  const [fotoKtp, setFotoKtp] = useState(null);
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(null);
  const [regError, setRegError] = useState(null);

  useEffect(() => {
    // 1. Fetch products
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error('Error fetching products:', err));

    // 2. Fetch coverages
    fetch(`${API_URL}/api/coverage`)
      .then(res => res.json())
      .then(data => setCoverages(data))
      .catch(err => console.error('Error fetching coverages:', err));

    // 3. Load Lampung province boundary GeoJSON
    fetch('/lampung.geojson')
      .then(res => res.json())
      .then(data => setLampungGeoJson(data))
      .catch(err => console.error('Error loading Lampung GeoJSON:', err));

    // 4. Request location on page load
    requestBrowserLocation();
  }, []);

  const requestBrowserLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolokasi tidak didukung oleh browser Anda.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);
    setGeoResult(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Pan map to user
        setMapCenter([latitude, longitude]);
        setMapZoom(11);

        try {
          // Reverse geocode using OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();

          if (data && data.address) {
            const addr = data.address;
            // Parse kabupaten and kecamatan from Nominatim payload
            const kabupaten = addr.city || addr.town || addr.municipality || addr.regency || addr.county || '';
            const kecamatan = addr.city_district || addr.district || addr.subdistrict || addr.suburb || addr.village || addr.neighbourhood || '';

            if (kabupaten && kecamatan) {
              checkCoverageAPI(kabupaten, kecamatan, latitude, longitude);
            } else {
              setGeoError(`Lokasi terdeteksi (${latitude.toFixed(4)}, ${longitude.toFixed(4)}), silakan ketik wilayah Anda secara manual.`);
              setGeoLoading(false);
            }
          } else {
            setGeoError('Gagal mendeteksi nama wilayah dari koordinat Anda.');
            setGeoLoading(false);
          }
        } catch (err) {
          setGeoError('Gagal menghubungkan ke layanan geocoding.');
          setGeoLoading(false);
        }
      },
      (err) => {
        let msg = 'Izin lokasi ditolak atau tidak tersedia.';
        if (err.code === 1) msg = 'Akses lokasi ditolak. Silakan masukkan wilayah secara manual.';
        else if (err.code === 2) msg = 'Lokasi tidak dapat ditentukan.';
        else if (err.code === 3) msg = 'Waktu permintaan lokasi habis.';

        setGeoError(msg);
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const checkCoverageAPI = (kabupaten, kecamatan, lat = null, lon = null) => {
    setGeoLoading(true);
    setGeoError(null);

    const payload = { kabupaten, kecamatan };
    if (lat !== null && lon !== null) {
      payload.latitude = lat;
      payload.longitude = lon;
    }

    fetch(`${API_URL}/api/coverage/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(data => {
        setGeoResult({
          status: data.status,
          kabupaten: data.coverage ? data.coverage.kabupaten : kabupaten,
          kecamatan: data.coverage ? data.coverage.kecamatan : kecamatan,
          details: data.coverage
        });

        // If coverage is found, center map to that coverage coords if available
        if (data.coverage && data.coverage.latitude && data.coverage.longitude) {
          setMapCenter([data.coverage.latitude, data.coverage.longitude]);
          setMapZoom(12);
        }

        setGeoLoading(false);
      })
      .catch(err => {
        setGeoError('Gagal melakukan verifikasi coverage area.');
        setGeoLoading(false);
      });
  };

  const handleManualCheck = (e) => {
    e.preventDefault();
    if (!manualKab || !manualKec) return;
    checkCoverageAPI(manualKab, manualKec);
  };

  // Registration form submit handler
  const handleRegistration = (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError(null);

    const formData = new FormData();
    formData.append('nama', regForm.nama);
    formData.append('telepon', regForm.telepon);
    formData.append('alamat', regForm.alamat);
    formData.append('kabupaten', geoResult?.kabupaten || manualKab);
    formData.append('kecamatan', geoResult?.kecamatan || manualKec);

    if (regForm.paket_id) {
      formData.append('paket_id', regForm.paket_id);
    }
    if (fotoRumah) {
      formData.append('foto_rumah', fotoRumah);
    }
    if (fotoKtp) {
      formData.append('foto_ktp', fotoKtp);
    }

    fetch(`${API_URL}/api/registrations`, {
      method: 'POST',
      body: formData,
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setRegSuccess(data.message);
          setRegForm({ nama: '', telepon: '', alamat: '', paket_id: '' });
          setFotoRumah(null);
          setFotoKtp(null);
          setShowRegForm(false);
        } else {
          let errorMsg = data.message || 'Terjadi kesalahan saat mengirim data.';
          if (data.errors) {
            const errs = Object.values(data.errors).flat();
            if (errs.length > 0) errorMsg = errs.join(' ');
          }
          setRegError(errorMsg);
        }
        setRegLoading(false);
      })
      .catch(() => {
        setRegError('Gagal menghubungi server. Coba lagi nanti.');
        setRegLoading(false);
      });
  };

  // Stats chart data
  const availableCount = coverages.filter(c => c.status === 'Tersedia').length;
  const unavailableCount = coverages.length - availableCount;

  const chartData = {
    labels: ['Tersedia', 'Belum Tersedia'],
    datasets: [
      {
        data: [availableCount || 1, unavailableCount || 1],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Inter', weight: '600', size: 12 },
          color: '#495057',
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      }
    },
    cutout: '72%',
    responsive: true,
    maintainAspectRatio: true,
  };

  // Leaflet map rendering styles
  const lampungStyle = {
    color: '#374151',
    weight: 2,
    opacity: 0.3,
    fillColor: '#6b7280',
    fillOpacity: 0.05,
  };

  return (
    <div className="hero-gradient min-vh-100">
      {/* Clean White Navbar (Reference Image 2 style) */}
      <div className="container">
        <header className="floating-navbar" style={{ flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <a href="#" className="nav-logo">
              <Wifi size={20} color="#7E287B" />
              MyRepublic <span style={{ color: '#7E287B' }}>Lampung</span>
            </a>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
          <nav className={`nav-links${mobileMenuOpen ? ' open' : ''}`}>
            <a href="#coverage-section" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Coverage</a>
            <a href="#products-section" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Paket Internet</a>
            <a href="#stats-section" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Statistik</a>
            <a
              href="#admin"
              className="btn btn-primary btn-pill"
              style={{ padding: '8px 20px', fontSize: '13px' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin Panel
            </a>
          </nav>
        </header>
      </div>

      {/* Hero Section (Reference Image 2 style - centered, clean) */}
      <section className="hero-section">
        <div className="container">
          {/* Review badge like reference */}
          <div className="review-badge animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="#7E287B" strokeWidth={0} />
              ))}
            </div>
            <span>Dipercaya oleh <strong style={{ color: '#111' }}>1,200+</strong> pelanggan di Lampung</span>
          </div>

          <h1 className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Nikmati Internet Stabil & Tanpa Batas di Rumah Anda
          </h1>

          <p className="hero-sub animate-fade-in" style={{ animationDelay: '0.3s' }}>
            MyRepublic hadir di Lampung membawa kebebasan streaming, gaming, dan work-from-home tanpa buffering.
          </p>

          <div className="hero-buttons animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <a href="#coverage-section" className="btn btn-primary btn-pill" style={{ background: '#7E287B' }}>
              Cek Coverage
            </a>
            <a href="#products-section" className="btn btn-outline-primary btn-pill">
              Lihat Paket
            </a>
          </div>
        </div>
      </section>

      {/* Geolocation Coverage Checker */}
      <section id="coverage-section" className="container" style={{ paddingTop: '40px' }}>
        <div className="grid grid-2" style={{ gap: '24px' }}>
          {/* Form and Status Card */}
          <div className="coverage-checker animate-fade-in">
            <h3>
              <MapPin size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px', color: '#7E287B' }} />
              Cek Jangkauan Layanan
            </h3>
            <p>
              Izinkan akses lokasi untuk pengecekan otomatis, atau masukkan detail kecamatan secara manual.
            </p>

            <button
              onClick={requestBrowserLocation}
              className="btn btn-primary w-100"
              disabled={geoLoading}
              style={{ background: '#7E287B', borderRadius: 'var(--radius-sm)' }}
            >
              <Compass className={geoLoading ? 'animate-spin' : ''} size={16} />
              {geoLoading ? 'Mendeteksi Lokasi...' : 'Deteksi Lokasi Saya'}
            </button>

            <div className="divider-with-text">
              <hr />
              <span>Atau cari manual</span>
              <hr />
            </div>

            <form onSubmit={handleManualCheck}>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Kabupaten / Kota (cth: Bandar Lampung)"
                  value={manualKab}
                  onChange={(e) => setManualKab(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Kecamatan (cth: Kedamaian)"
                  value={manualKec}
                  onChange={(e) => setManualKec(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-secondary w-100" style={{ borderColor: 'rgba(126, 40, 123, 0.3)', color: '#7E287B' }}>
                <Search size={16} />
                Cek Secara Manual
              </button>
            </form>

            {/* Error Feedback */}
            {geoError && (
              <div className="error-message">
                <XCircle size={18} style={{ flexShrink: 0 }} />
                <span>{geoError}</span>
              </div>
            )}

            {/* Results */}
            {geoResult && (
              <div className={`result-card animate-fade-in ${geoResult.status === 'Tersedia' ? 'success' : 'danger'}`}>
                {geoResult.status === 'Tersedia' ? (
                  <>
                    <CheckCircle size={40} color="#22c55e" />
                    <div>
                      <h4 style={{ color: '#22c55e' }}>Layanan TERSEDIA!</h4>
                      <p>
                        Kecamatan <strong>{geoResult.kecamatan}</strong>, {geoResult.kabupaten} telah tercover jaringan fiber optic kami.
                      </p>
                    </div>
                    {!showRegForm && !regSuccess && (
                      <button
                        className="btn btn-primary"
                        style={{ background: '#7E287B', marginTop: '8px' }}
                        onClick={() => { setShowRegForm(true); setRegSuccess(null); }}
                      >
                        <UserPlus size={16} />
                        Daftar Sekarang
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <XCircle size={40} color="#ef4444" />
                    <div>
                      <h4 style={{ color: '#ef4444' }}>Layanan BELUM TERSEDIA</h4>
                      <p>
                        Kecamatan <strong>{geoResult.kecamatan}</strong>, {geoResult.kabupaten} belum terjangkau. Kami terus memperluas jaringan kami!
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Registration Success Feedback */}
            {regSuccess && (
              <div className="result-card success animate-fade-in" style={{ marginTop: '12px' }}>
                <CheckCircle size={32} color="#22c55e" />
                <div>
                  <h4 style={{ color: '#22c55e' }}>Pendaftaran Berhasil!</h4>
                  <p>{regSuccess}</p>
                </div>
              </div>
            )}


          </div>

          {/* Interactive Map */}
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
            <div className="map-container" style={{ border: 'none', borderRadius: 0 }}>
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {/* Controller to handle pan updates */}
                <MapController center={mapCenter} zoom={mapZoom} />

                {/* Draw Lampung boundary GeoJSON */}
                {lampungGeoJson && (
                  <GeoJSON
                    data={lampungGeoJson}
                    style={lampungStyle}
                  />
                )}

                {/* Highlight coverages */}
                {coverages.map((cov) => {
                  if (cov.status !== 'Tersedia') return null;

                  if (cov.geojson) {
                    try {
                      const parsedGeoJson = JSON.parse(cov.geojson);
                      return (
                        <GeoJSON
                          key={`poly-${cov.id}`}
                          data={parsedGeoJson}
                          style={{
                            color: '#7E287B',
                            weight: 2,
                            fillColor: '#7E287B',
                            fillOpacity: 0.35,
                          }}
                        >
                          <Popup>
                            <strong>Kecamatan {cov.kecamatan}</strong><br />
                            Kabupaten: {cov.kabupaten}<br />
                            <span style={{ color: '#22c55e', fontWeight: 600 }}>Status: Tersedia</span>
                          </Popup>
                        </GeoJSON>
                      );
                    } catch (e) {
                      console.error('Error parsing coverage polygon:', e);
                    }
                  }

                  if (cov.latitude && cov.longitude) {
                    return (
                      <React.Fragment key={`group-${cov.id}`}>
                        <Circle
                          center={[cov.latitude, cov.longitude]}
                          radius={2500}
                          pathOptions={{
                            color: '#7E287B',
                            fillColor: '#7E287B',
                            fillOpacity: 0.35,
                            weight: 2
                          }}
                        >
                          <Popup>
                            <strong>Kecamatan {cov.kecamatan}</strong><br />
                            Kabupaten: {cov.kabupaten}<br />
                            <span style={{ color: '#22c55e', fontWeight: 600 }}>Status: Tersedia</span>
                          </Popup>
                        </Circle>
                        <Marker position={[cov.latitude, cov.longitude]}>
                          <Popup>
                            <strong>Kecamatan {cov.kecamatan}</strong><br />
                            Kabupaten: {cov.kabupaten}<br />
                            <span style={{ color: '#22c55e', fontWeight: 600 }}>Status: Tersedia</span>
                          </Popup>
                        </Marker>
                      </React.Fragment>
                    );
                  }

                  return null;
                })}
              </MapContainer>
            </div>
            <div className="map-legend" style={{ padding: '12px 0', background: 'var(--white)' }}>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#7E287B', opacity: 0.6 }}></span>
                <span>Wilayah Tercover</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#9ca3af', opacity: 0.3 }}></span>
                <span>Luar Lampung</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Package Products Section */}
      <section id="products-section" style={{ padding: '80px 0 40px' }}>
        <div className="container">
          <div className="section-header">
            <h2>Paket Internet Unggulan</h2>
            <p>Pilih kecepatan internet terbaik yang cocok untuk kebutuhan Anda.</p>
          </div>

          <div className="grid grid-3">
            {products.map((prod) => (
              <div key={prod.id} className="product-card">
                <div className="product-name">{prod.nama_paket}</div>
                <div className="product-speed">{prod.kecepatan}</div>
                <p className="product-desc">{prod.deskripsi}</p>
                <hr className="product-divider" />
                <div className="product-price">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(prod.harga)}
                  <span> /bulan</span>
                </div>
                <a
                  href="#coverage-section"
                  className="btn btn-primary"
                  style={{
                    background: '#7E287B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none'
                  }}
                  onClick={() => {
                    setRegForm(prev => ({ ...prev, paket_id: prod.id }));
                  }}
                >
                  Langganan Sekarang
                  <ArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" style={{ padding: '40px 0 80px' }}>
        <div className="container">
          <div className="stats-section">
            <div className="grid grid-2" style={{ alignItems: 'center' }}>
              <div>
                <h2>Statistik Coverage Lampung</h2>
                <p style={{ color: 'var(--gray-600)', marginBottom: '28px', fontSize: '14px' }}>
                  Kami terus bekerja keras memperluas kabel fiber optic kami ke seluruh pelosok provinsi Lampung.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={20} color="#22c55e" />
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dark)' }}>{availableCount} Kecamatan Tercover</div>
                      <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Jaringan broadband aktif kecepatan tinggi.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Laptop size={20} color="#ef4444" />
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dark)' }}>{unavailableCount} Kecamatan Menunggu</div>
                      <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>Masuk dalam rencana survei dan perluasan.</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                <div style={{ width: '100%', maxWidth: '220px' }}>
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container">
        <div className="landing-footer">
          &copy; {new Date().getFullYear()} MyRepublic Lampung. All rights reserved.
        </div>
      </footer>

      {/* Registration Form Popup Modal (rendered at the root to avoid transform container limitations) */}
      {showRegForm && geoResult?.status === 'Tersedia' && (
        <div className="modal-overlay" onClick={() => { setShowRegForm(false); setRegError(null); }}>
          <div className="modal-card" style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--gray-200)', paddingBottom: '12px' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 700 }}>
                <UserPlus size={20} color="#7E287B" />
                Formulir Pendaftaran
              </h4>
              <button
                type="button"
                onClick={() => { setShowRegForm(false); setRegError(null); }}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--gray-500)' }}
              >
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '20px' }}>
              Wilayah: <strong>{geoResult.kecamatan}</strong>, {geoResult.kabupaten}
            </p>

            <form onSubmit={handleRegistration}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <UserPlus size={13} /> Nama Lengkap
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Masukkan nama lengkap Anda"
                  value={regForm.nama}
                  onChange={(e) => setRegForm({ ...regForm, nama: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} /> Nomor Telepon / WhatsApp
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="Contoh: 08123456789"
                  value={regForm.telepon}
                  onChange={(e) => setRegForm({ ...regForm, telepon: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Home size={13} /> Alamat Lengkap
                </label>
                <textarea
                  className="form-control"
                  placeholder="Jalan, RT/RW, Kelurahan/Desa"
                  rows={3}
                  style={{ resize: 'vertical' }}
                  value={regForm.alamat}
                  onChange={(e) => setRegForm({ ...regForm, alamat: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pilih Paket</label>
                <select
                  required
                  className="form-control"
                  value={regForm.paket_id}
                  onChange={(e) => setRegForm({ ...regForm, paket_id: e.target.value })}
                >
                  <option value="">Pilih Paket</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_paket} — {p.kecepatan} — Rp {Number(p.harga).toLocaleString('id-ID')}/bln
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Camera size={13} /> Foto Rumah
                </label>
                <input
                  required
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => setFotoRumah(e.target.files[0] || null)}
                />
                <small style={{ fontSize: '11px', color: 'var(--gray-500)', display: 'block', marginTop: '4px' }}>
                  Format: JPG, JPEG, PNG (Maks 5MB)
                </small>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Camera size={13} /> Foto KTP
                </label>
                <input
                  required
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => setFotoKtp(e.target.files[0] || null)}
                />
                <small style={{ fontSize: '11px', color: 'var(--gray-500)', display: 'block', marginTop: '4px' }}>
                  Format: JPG, JPEG, PNG (Maks 5MB)
                </small>
              </div>

              {regError && (
                <div className="error-message" style={{ marginBottom: '12px' }}>
                  <XCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{regError}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ background: '#7E287B', flex: 1 }}
                  disabled={regLoading}
                >
                  <Send size={14} />
                  {regLoading ? 'Mengirim...' : 'Kirim Pendaftaran'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowRegForm(false); setRegError(null); }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
