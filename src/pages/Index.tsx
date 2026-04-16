import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import * as THREE from "three";
import "./Index.css";
import { BookOpen } from "lucide-react";

// Custom Hooks for Scroll Handling
const useScrollReveal = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -100px 0px" });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
};

const useScrollProgress = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return scrolled;
};

const useScrollPosition = () => {
  const [pos, setPos] = useState(0);
  useEffect(() => {
    const handler = () => setPos(window.scrollY);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  return pos;
};

// UI Components
const Logo = ({ className = "h-9 w-9" }) => (
  <div className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 ${className} shadow-md`}>
    <BookOpen className="text-white w-3/5 h-3/5" strokeWidth={2.5} />
  </div>
);

const ThreeBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0xF8FAFC, 0.02);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 12;
    camera.position.y = 1;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // MATERIALS
    const ultraGlass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.1, roughness: 0.05,
      transmission: 1.0, ior: 1.5, thickness: 2.5,
      clearcoat: 1.0, clearcoatRoughness: 0.1,
      transparent: true, opacity: 1,
      side: THREE.DoubleSide
    });

    const holographicBlue = new THREE.MeshPhysicalMaterial({
      color: 0x06B6D4, metalness: 0.3, roughness: 0.2,
      transmission: 0.8, ior: 1.3, thickness: 1.5,
      clearcoat: 1.0, transparent: true, opacity: 0.9
    });

    const solidDeepBlue = new THREE.MeshStandardMaterial({
      color: 0x2563EB, roughness: 0.2, metalness: 0.4
    });

    // FOCAL OBJECT
    const focalGeo = new THREE.TorusKnotGeometry(4, 1.2, 256, 64);
    const focalMesh = new THREE.Mesh(focalGeo, ultraGlass);
    focalMesh.position.set(6, 0, -8);
    scene.add(focalMesh);

    const innerFocalGeo = new THREE.IcosahedronGeometry(3.5, 2);
    const innerFocalMesh = new THREE.Mesh(innerFocalGeo, holographicBlue);
    innerFocalMesh.position.set(6, 0, -8);
    scene.add(innerFocalMesh);

    // BACKGROUND TUNNEL
    const shapes: THREE.Mesh[] = [];
    const geometries = [
      new THREE.TorusGeometry(1, 0.3, 16, 50),
      new THREE.IcosahedronGeometry(1.2, 0),
      new THREE.OctahedronGeometry(1.5, 0),
      new THREE.TetrahedronGeometry(1, 0),
      new THREE.RingGeometry(0.8, 1.2, 32),
      new THREE.DodecahedronGeometry(1.5, 0)
    ];

    const materials = [ultraGlass, holographicBlue, ultraGlass, solidDeepBlue, holographicBlue, solidDeepBlue];

    for (let i = 0; i < 80; i++) {
      const geoOffset = i % geometries.length;
      const mesh = new THREE.Mesh(geometries[geoOffset], materials[geoOffset]);
      const zDepth = 5 - (Math.random() * 65);
      const spread = Math.abs(zDepth) * 0.4 + 10;

      mesh.position.set(
        (Math.random() - 0.5) * spread * 1.5,
        (Math.random() - 0.5) * spread,
        zDepth
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.userData = {
        rx: (Math.random() - 0.5) * 0.01,
        ry: (Math.random() - 0.5) * 0.01,
        py: Math.random() * Math.PI * 2,
        speed: 0.002 + Math.random() * 0.003
      };
      shapes.push(mesh);
      scene.add(mesh);
    }

    // STARDUST
    const pGeo = new THREE.BufferGeometry();
    const pCount = 2000;
    const pPositions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) { pPositions[i] = (Math.random() - 0.5) * 80; }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x3B82F6, size: 0.1, transparent: true, opacity: 0.5 });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // LIGHTING
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 20);
    scene.add(mainLight);
    const cyanFill = new THREE.PointLight(0x06B6D4, 2, 50);
    cyanFill.position.set(-10, 5, -10);
    scene.add(cyanFill);
    const purpleGlow = new THREE.PointLight(0x8B5CF6, 2, 50);
    purpleGlow.position.set(10, -10, -20);
    scene.add(purpleGlow);

    // EVENT LISTENERS AND ANIMATION
    let targetX = 0; let targetY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animId: number;
    const clock = new THREE.Clock();
    const baseCameraZ = 12;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      focalMesh.rotation.y = elapsed * 0.1;
      focalMesh.rotation.x = elapsed * 0.05;
      innerFocalMesh.rotation.y = -elapsed * 0.15;
      innerFocalMesh.rotation.z = elapsed * 0.1;

      shapes.forEach(shape => {
        shape.rotation.x += shape.userData.rx;
        shape.rotation.y += shape.userData.ry;
        shape.position.y += Math.sin(elapsed + shape.userData.py) * shape.userData.speed;
      });

      points.rotation.y = elapsed * 0.02;

      const scrollFactor = window.scrollY * 0.015;
      const idealCamZ = baseCameraZ - scrollFactor;

      camera.position.x += (targetX * 4 - camera.position.x) * 0.05;
      camera.position.y += (-targetY * 2 + 1 - camera.position.y) * 0.05;
      camera.position.z += (idealCamZ - camera.position.z) * 0.05;

      camera.lookAt(0, 0, camera.position.z - 10);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      focalGeo.dispose(); innerFocalGeo.dispose();
      geometries.forEach(g => g.dispose());
      ultraGlass.dispose(); holographicBlue.dispose(); solidDeepBlue.dispose();
    };
  }, []);

  return <canvas id="three-canvas" ref={canvasRef}></canvas>;
};

const Navbar = () => {
  const scrolled = useScrollProgress();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <nav className={`lp-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="lp-container nav-container">
        <a href="#" className="nav-logo">
          <Logo />
          Study Center
        </a>
        <div className={`nav-links ${mobileNavOpen ? 'open' : ''}`}>
          <a href="#">Platform</a>
          <a href="#">Solutions</a>
          <a href="#features">Features</a>
          <a href="#">Pricing</a>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn-secondary" style={{ padding: '12px 28px', fontSize: '15px' }}>Sign In</Link>
        </div>
        <button className="hamburger" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
          {mobileNavOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="hero">
      <div className="lp-container hero-content">
        <div className="badge-pill reveal d-1"><span></span> Next-Gen Interactive Learning</div>
        <h1 className="reveal d-2">
          The modern hub for <br /> <span className="text-gradient">Student Excellence.</span>
        </h1>
        <p className="reveal d-3">
          Dive into an immersive academic ecosystem. Access verified materials, track your progress with absolute precision, and master subjects in a platform built for brilliant minds.
        </p>
        <div className="hero-buttons reveal d-4">
          <Link to="/signup" className="btn-primary">Get Started Free</Link>
          <a href="#features" className="btn-secondary">Explore Platform</a>
        </div>

        <div className="hero-stats glass-card reveal d-4" style={{ marginTop: '20px', borderRadius: '100px' }}>
          <span><b className="stat-icon">12k+</b> Students</span>
          <div className="stat-divider"></div>
          <span><b className="stat-icon text-gradient-purple">450+</b> Subjects</span>
          <div className="stat-divider"></div>
          <span><b className="stat-icon" style={{ color: '#10B981' }}>99%</b> Success Rate</span>
        </div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    { icon: '📚', title: 'Curated Taxonomies', desc: 'Navigate beautifully structured course hierarchies with deep-linked prerequisites and syllabus tracking.' },
    { icon: '⚡', title: 'Instant Verification', desc: 'All materials undergo rigorous admin quality checks leveraging AI for phenomenal precision.' },
    { icon: '📈', title: 'Momentum Analytics', desc: 'Keep incredible momentum with personalized dashboard metrics and real-time study progress views.' }
  ];

  return (
    <section id="features">
      <div className="lp-container">
        <div className="section-label reveal">Platform Capabilities</div>
        <h2 className="section-title reveal d-1">Intelligent by design</h2>
        <p className="section-subtitle mb-12 reveal d-2" style={{ marginBottom: '72px' }}>An infrastructure built from the ground up to eliminate clutter and drastically accelerate your learning velocity.</p>

        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className={`glass-card feature-card reveal d-${(i % 3) + 1}`}>
              <div className="feature-icon-wrapper">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ScaleStats = () => {
  return (
    <section style={{ padding: '60px 0' }}>
      <div className="lp-container">
        <div className="glass-card huge-stats reveal">
          <div className="huge-stat-box">
            <div className="huge-number text-gradient">2.4M</div>
            <div className="huge-label">Files Uploaded</div>
          </div>
          <div className="huge-stat-box">
            <div className="huge-number text-gradient-purple">12ms</div>
            <div className="huge-label">Search Latency</div>
          </div>
          <div className="huge-stat-box">
            <div className="huge-number text-gradient" style={{ background: 'linear-gradient(135deg, #06B6D4, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>0%</div>
            <div className="huge-label">Platform Downtime</div>
          </div>
          <div className="huge-stat-box">
            <div className="huge-number text-gradient" style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>24/7</div>
            <div className="huge-label">Admin Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}

const CTA = () => {
  return (
    <section className="cta-section">
      <div className="lp-container">
        <h2 className="cta-title reveal">Ready to dive in?</h2>
        <p className="cta-subtitle reveal d-1">Join the most advanced study network in the world. Free setup.</p>
        <div className="reveal d-2">
          <Link to="/signup" className="btn-primary" style={{ fontSize: '20px', padding: '24px 64px' }}>Create Your Account</Link>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer>
      <div className="lp-container">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="nav-logo" style={{ fontSize: '22px' }}>
              <Logo className="w-7 h-7" />
              Study Center
            </a>
            <p>The modern, flawlessly designed academic hub for ambitious students and expert educators pushing the boundaries of what is possible.</p>
          </div>
          <div className="footer-links-group">
            <h4>Product</h4>
            <Link to="/dashboard">Student Dashboard</Link>
            <a href="#">Educator Tools</a>
            <a href="#">API Integrations</a>
          </div>
          <div className="footer-links-group">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Contact Support</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Study Center Inc. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '32px' }}>
            <a href="#">Terms &amp; Conditions</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const Index = () => {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect users who are already logged in to their respective dashboards
  useEffect(() => {
    if (loading) return;
    if (session) {
      if (profile?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [session, profile, loading, navigate]);

  useScrollReveal();
  const _pos = useScrollPosition();

  // Render the full immersive Landing Page
  return (
    <div className="landing-page">
      <div className="ambient-glow">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <ThreeBackground />
      <Navbar />
      <main style={{ position: 'relative', zIndex: 10 }}>
        <Hero />
        <Features />
        <ScaleStats />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
