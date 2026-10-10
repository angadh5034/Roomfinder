import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/Footer.css";

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="footer">

      {/* ── Top Section ── */}
      <div className="footer-top">
        <div className="footer-container">

          {/* Company Info */}
          <div className="footer-col footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="38" height="38" rx="10" fill="#1a5276"/>
                  <path d="M19 7L6 17H9V31H16V23H22V31H29V17H32L19 7Z" fill="#4db8ff"/>
                  <rect x="15" y="23" width="8" height="8" rx="1" fill="#0a1628"/>
                  <circle cx="19" cy="16" r="2.5" fill="#ffffff"/>
                </svg>
              </div>
              <div>
                <div className="footer-logo-name">Sweet Home</div>
                <div className="footer-logo-tag">Find Your Perfect Space</div>
              </div>
            </div>
            <p className="footer-desc">
              Sweet Home is your trusted platform for finding and listing rental rooms across India.
              We connect room owners with potential tenants — simple, safe, and fast.
            </p>
            {/* Social Links */}
            <div className="footer-socials">
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-btn" title="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                LinkedIn
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="social-btn" title="GitHub">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                GitHub
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-btn" title="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                Facebook
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-btn" title="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="#0a1628"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                Instagram
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="social-btn" title="X (Twitter)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                X
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">🏠 Home</Link></li>
              <li><Link to="/about">ℹ️ About Us</Link></li>
              <li><Link to="/services">⚙️ Services</Link></li>
              <li><Link to="/contact">📞 Contact</Link></li>
              <li><Link to="/addroom">➕ Add Room</Link></li>
              <li><a href="#">❓ FAQ</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-col">
            <h4 className="footer-col-title">Contact Us</h4>
            <ul className="footer-contact-list">
              <li>
                <span className="contact-icon">📞</span>
                <div>
                  <div className="contact-label">Phone</div>
                  <a href="tel:+919876543210">+91 98765 43210</a>
                </div>
              </li>
              <li>
                <span className="contact-icon">✉️</span>
                <div>
                  <div className="contact-label">Email</div>
                  <a href="mailto:hello@sweethome.in">hello@sweethome.in</a>
                </div>
              </li>
              <li>
                <span className="contact-icon">📍</span>
                <div>
                  <div className="contact-label">Address</div>
                  <span>Sitabuldi, Nagpur,<br />Maharashtra 440012</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Legal + Newsletter */}
          <div className="footer-col">
            <h4 className="footer-col-title">Legal</h4>
            <ul className="footer-links">
              <li><a href="#">🔒 Privacy Policy</a></li>
              <li><a href="#">📄 Terms & Conditions</a></li>
              <li><a href="#">🍪 Cookie Policy</a></li>
              <li><a href="#">⚠️ Disclaimer</a></li>
            </ul>

            {/* Newsletter */}
            <h4 className="footer-col-title" style={{ marginTop: "24px" }}>Newsletter</h4>
            <p className="newsletter-desc">Get the latest room listings in your inbox.</p>
            {subscribed ? (
              <div className="subscribed-msg">✅ Thank you for subscribing!</div>
            ) : (
              <div className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="newsletter-input"
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                />
                <button className="newsletter-btn" onClick={handleSubscribe}>
                  Subscribe
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="footer-bottom">
        <div className="footer-container footer-bottom-inner">
          <p className="copyright">
            © 2026 <strong>Sweet Home</strong>. All Rights Reserved.
          </p>
          <p className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <span className="dot-sep">·</span>
            <a href="#">Terms</a>
            <span className="dot-sep">·</span>
            <a href="#">Sitemap</a>
          </p>
          <p className="made-with">
            Made with ❤️ in Nagpur, India
          </p>
        </div>
      </div>

    </footer>
  );
}

export default Footer;
