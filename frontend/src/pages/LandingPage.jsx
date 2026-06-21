import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { MapPin, Search, Compass, Shield, Wifi, Zap, CheckCircle, XCircle, ArrowRight, Laptop } from 'lucide-react';
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
            const kecamatan = addr.suburb || addr.city_district || addr.district || addr.village || addr.neighbourhood || '';
            
            if (kabupaten && kecamatan) {
              checkCoverageAPI(kabupaten, kecamatan);
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

  const checkCoverageAPI = (kabupaten, kecamatan) => {
    setGeoLoading(true);
    setGeoError(null);

    fetch(`${API_URL}/api/coverage/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ kabupaten, kecamatan }),
    })
      .then(res => res.json())
      .then(data => {
        setGeoResult({
          status: data.status,
          kabupaten: kabupaten,
          kecamatan: kecamatan,
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

  // Stats chart data
  const availableCount = coverages.filter(c => c.status === 'Tersedia').length;
  const unavailableCount = coverages.length - availableCount;

  const chartData = {
    labels: ['Tersedia', 'Belum Tersedia'],
    datasets: [
      {
        data: [availableCount || 1, unavailableCount || 1],
        backgroundColor: ['#10b981', '#ef4444'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Plus Jakarta Sans', weight: '600' },
          color: '#374151'
        }
      }
    },
    cutout: '70%',
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
    <div className="hero-gradient min-vh-100 pb-5">
      {/* Floating Dark Navbar */}
      <div className="container">
        <header className="floating-navbar">
          <a href="#" className="nav-logo">
            <Wifi size={24} color="#7E287B" />
            MyRepublic <span style={{ color: '#7E287B' }}>Lampung</span>
          </a>
          <nav className="nav-links">
            <a href="#coverage-section" className="nav-link">Coverage</a>
            <a href="#products-section" className="nav-link">Paket Internet</a>
            <a href="#stats-section" className="nav-link">Statistik</a>
            <a href="#admin" className="nav-link btn btn-secondary" style={{ padding: '6px 16px', color: '#fff', background: '#7E287B', border: 'none' }}>Admin Panel</a>
          </nav>
        </header>
      </div>

      {/* Hero Section */}
      <section className="container mt-5 pt-3 text-center">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <span className="badge badge-success mb-3 animate-fade-in" style={{ background: 'rgba(126, 40, 123, 0.1)', color: '#7E287B' }}>
            Koneksi Ultra Cepat Lampung
          </span>
          <h1 className="display-4 text-dark mb-3 animate-fade-in" style={{ fontSize: '3rem', lineHeight: '1.2' }}>
            Nikmati Internet Stabil & Tanpa Batas di Rumah Anda
          </h1>
          <p className="lead text-gray-600 mb-5 animate-fade-in" style={{ fontSize: '1.15rem' }}>
            MyRepublic hadir di Lampung membawa kebebasan streaming, gaming, dan work-from-home tanpa buffering.
          </p>
        </div>
      </section>

      {/* Geolocation Coverage Checker */}
      <section id="coverage-section" className="container mt-4">
        <div className="grid grid-2">
          {/* Form and Status Card */}
          <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 className="mb-2" style={{ color: '#7E287B', fontSize: '24px' }}>Cek Jangkauan Layanan</h3>
            <p className="text-gray-600 mb-4" style={{ fontSize: '14px' }}>
              Izinkan akses lokasi untuk pengecekan otomatis, atau masukkan detail kecamatan secara manual.
            </p>

            <button 
              onClick={requestBrowserLocation} 
              className="btn btn-primary w-100 mb-4"
              disabled={geoLoading}
              style={{ background: '#7E287B' }}
            >
              <Compass className={geoLoading ? 'animate-spin' : ''} size={18} />
              {geoLoading ? 'Mendeteksi Lokasi...' : 'Deteksi Lokasi Saya'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '8px 0 24px' }}>
              <hr style={{ flexGrow: 1, border: 'none', borderTop: '1px solid #e2e8f0' }} />
              <span style={{ padding: '0 16px', fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>ATAU CARI MANUAL</span>
              <hr style={{ flexGrow: 1, border: 'none', borderTop: '1px solid #e2e8f0' }} />
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
              <button type="submit" className="btn btn-secondary w-100" style={{ borderColor: '#7E287B', color: '#7E287B' }}>
                <Search size={18} />
                Cek Secara Manual
              </button>
            </form>

            {/* Results / Feedback */}
            {geoError && (
              <div className="badge badge-danger mt-4" style={{ padding: '16px', borderRadius: '12px', display: 'flex', gap: '8px', alignItems: 'flex-start', width: '100%' }}>
                <XCircle size={20} style={{ flexShrink: 0 }} />
                <span style={{ textAlign: 'left', fontSize: '13px' }}>{geoError}</span>
              </div>
            )}

            {geoResult && (
              <div 
                className={`badge mt-4 animate-fade-in ${geoResult.status === 'Tersedia' ? 'badge-success' : 'badge-danger'}`} 
                style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}
              >
                {geoResult.status === 'Tersedia' ? (
                  <>
                    <CheckCircle size={48} color="#10b981" />
                    <div style={{ textAlign: 'center' }}>
                      <h4 style={{ color: '#10b981', margin: '4px 0', fontSize: '18px' }}>Layanan TERSEDIA!</h4>
                      <p style={{ color: '#374151', margin: 0, fontSize: '13px' }}>
                        Kecamatan <strong>{geoResult.kecamatan}</strong>, {geoResult.kabupaten} telah tercover jaringan fiber optic kami.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle size={48} color="#ef4444" />
                    <div style={{ textAlign: 'center' }}>
                      <h4 style={{ color: '#ef4444', margin: '4px 0', fontSize: '18px' }}>Layanan BELUM TERSEDIA</h4>
                      <p style={{ color: '#374151', margin: 0, fontSize: '13px' }}>
                        Kecamatan <strong>{geoResult.kecamatan}</strong>, {geoResult.kabupaten} belum terjangkau. Kami terus memperluas jaringan kami!
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Interactive Map Visualisation */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <div className="map-container">
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

                {/* Draw Lampung boundary GeoJSON (grey out external context) */}
                {lampungGeoJson && (
                  <GeoJSON 
                    data={lampungGeoJson} 
                    style={lampungStyle}
                  />
                )}

                {/* Highlight coverages */}
                {coverages.map((cov) => {
                  if (cov.status !== 'Tersedia') return null;

                  // 1. If it has full GeoJSON cached, render it as highlight polygon
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
                            <span style={{ color: '#10b981', fontWeight: 600 }}>Status: Tersedia</span>
                          </Popup>
                        </GeoJSON>
                      );
                    } catch (e) {
                      console.error('Error parsing coverage polygon:', e);
                    }
                  }

                  // 2. Fallback to marker if no geojson but has coordinates
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
                            <span style={{ color: '#10b981', fontWeight: 600 }}>Status: Tersedia</span>
                          </Popup>
                        </Circle>
                        <Marker 
                          position={[cov.latitude, cov.longitude]}
                        >
                          <Popup>
                            <strong>Kecamatan {cov.kecamatan}</strong><br />
                            Kabupaten: {cov.kabupaten}<br />
                            <span style={{ color: '#10b981', fontWeight: 600 }}>Status: Tersedia</span>
                          </Popup>
                        </Marker>
                      </React.Fragment>
                    );
                  }
                  
                  return null;
                })}
              </MapContainer>
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px', fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'block', width: '12px', height: '12px', background: '#7E287B', borderRadius: '3px', opacity: 0.5 }}></span>
                <span>Wilayah Tercover</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ display: 'block', width: '12px', height: '12px', background: '#9ca3af', borderRadius: '3px', opacity: 0.2 }}></span>
                <span>Luar Lampung</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Package Products Section */}
      <section id="products-section" className="container mt-5 pt-4">
        <div className="text-center mb-5">
          <h2 style={{ fontSize: '32px', color: '#7E287B' }}>Paket Internet Unggulan</h2>
          <p className="text-gray-600">Pilih kecepatan internet terbaik yang cocok untuk kebutuhan Anda.</p>
        </div>

        <div className="grid grid-3">
          {products.map((prod) => (
            <div key={prod.id} className="glass-card text-center" style={{ display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: '20px', fontWeight: 600, color: '#374151' }}>{prod.nama_paket}</h4>
              <div style={{ margin: '20px 0' }}>
                <span style={{ fontSize: '42px', fontWeight: 800, color: '#7E287B' }}>{prod.kecepatan}</span>
              </div>
              <p className="text-gray-600" style={{ fontSize: '14px', flexGrow: 1, minHeight: '60px' }}>{prod.deskripsi}</p>
              <hr style={{ border: 'none', borderTop: '1px solid #f1f3f5', margin: '24px 0' }} />
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#0f0f12' }}>
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(prod.harga)}
                </span>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>/bulan</span>
              </div>
              <button className="btn btn-primary" style={{ background: '#7E287B' }}>
                Langganan Sekarang
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Doughnut Section */}
      <section id="stats-section" className="container mt-5 pt-4">
        <div className="glass-card">
          <div className="grid grid-2" style={{ alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '32px', color: '#7E287B', marginBottom: '16px' }}>Statistik Coverage Lampung</h2>
              <p className="text-gray-600 mb-4">
                Kami terus bekerja keras memperluas kabel fiber optic kami ke seluruh pelosok provinsi Lampung.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Zap size={24} color="#10b981" />
                  <div>
                    <h5 style={{ margin: 0, fontSize: '16px' }}>{availableCount} Kecamatan Tercover</h5>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Jaringan broadband aktif kecepatan tinggi.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Laptop size={24} color="#ef4444" />
                  <div>
                    <h5 style={{ margin: 0, fontSize: '16px' }}>{unavailableCount} Kecamatan Menunggu</h5>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Masuk dalam rencana survei dan perluasan.</p>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', height: '240px' }}>
              <div style={{ width: '240px', height: '240px' }}>
                <Doughnut data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mt-5 pt-4 text-center" style={{ borderTop: '1px solid rgba(126, 40, 123, 0.1)' }}>
        <p className="text-gray-500" style={{ fontSize: '13px' }}>
          &copy; {new Date().getFullYear()} MyRepublic Lampung. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;
