import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PartnerWithUs = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    businessType: '',
    fleetSize: '',
    operatingRoutes: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your interest! Our partnership team will contact you within 24 hours.');
    setFormData({
      businessName: '',
      contactPerson: '',
      email: '',
      phone: '',
      businessType: '',
      fleetSize: '',
      operatingRoutes: '',
      message: ''
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#19183B] via-[#2D1B69] to-[#19183B]">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center text-2xl font-black text-white hover:text-brand-primary transition-colors duration-300">
              <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
              </svg>
              BoardEasy
            </Link>
            <Link to="/" className="text-white hover:text-brand-primary transition-colors duration-300 font-semibold">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Partner with <span className="text-brand-primary">BoardEasy</span>
          </h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-12">
            Join India's fastest-growing bus booking platform and transform your transportation business with cutting-edge technology and nationwide reach.
          </p>
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Partner with BoardEasy?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
                title: "Increased Revenue",
                description: "Boost your earnings by up to 40% with our dynamic pricing algorithms and demand forecasting"
              },
              {
                icon: <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>,
                title: "Zero Setup Cost",
                description: "Get started immediately with no upfront investment. Pay only when you earn"
              },
              {
                icon: <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>,
                title: "Advanced Analytics",
                description: "Real-time dashboards with passenger insights, route optimization, and performance metrics"
              },
              {
                icon: <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
                title: "Nationwide Reach",
                description: "Access to 50+ million travelers across 500+ cities with our extensive marketing network"
              },
              {
                icon: <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>,
                title: "24/7 Support",
                description: "Dedicated account managers and round-the-clock technical support for seamless operations"
              },
              {
                icon: <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>,
                title: "Digital Transformation",
                description: "Complete digitization of your operations with automated booking, payments, and reporting"
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-brand-primary transition-all duration-300 transform hover:scale-105">
                <div className="text-brand-primary mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{benefit.title}</h3>
                <p className="text-white/80">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Models */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Partnership Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Bus Operator",
                subtitle: "For Fleet Owners",
                features: ["Route Management", "Fleet Tracking", "Revenue Analytics", "Passenger Management", "Maintenance Scheduling"],
                commission: "8-12%",
                color: "from-blue-500 to-cyan-500"
              },
              {
                title: "Travel Agent",
                subtitle: "For Travel Agencies",
                features: ["Multi-operator Booking", "Commission Tracking", "Customer Management", "Bulk Booking Tools", "White-label Solution"],
                commission: "3-5%",
                color: "from-green-500 to-emerald-500"
              },
              {
                title: "Technology Partner",
                subtitle: "For Tech Companies",
                features: ["API Integration", "Custom Solutions", "Revenue Sharing", "Co-marketing", "Technical Support"],
                commission: "Negotiable",
                color: "from-purple-500 to-pink-500"
              }
            ].map((model, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-brand-primary transition-all duration-300 transform hover:scale-105">
                <div className={`bg-gradient-to-r ${model.color} p-6 text-center`}>
                  <h3 className="text-2xl font-bold text-white mb-2">{model.title}</h3>
                  <p className="text-white/90">{model.subtitle}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {model.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-white/80">
                        <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-brand-primary mb-2">{model.commission}</div>
                    <div className="text-white/60 text-sm">Commission Rate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                company: "Royal Travels",
                growth: "150% Revenue Growth",
                quote: "BoardEasy transformed our business. We went from 20 bookings per day to over 300 bookings with their platform.",
                person: "Rajesh Kumar, CEO"
              },
              {
                company: "Swift Transport",
                growth: "200+ New Routes",
                quote: "The analytics and route optimization helped us expand to 15 new cities within 6 months.",
                person: "Priya Sharma, Operations Head"
              }
            ].map((story, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
                <div className="text-brand-primary text-2xl font-bold mb-4">{story.growth}</div>
                <p className="text-white/80 text-lg mb-6 italic">"{story.quote}"</p>
                <div>
                  <div className="text-white font-bold">{story.company}</div>
                  <div className="text-white/60">{story.person}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Start Your Partnership Journey</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="businessName"
                  placeholder="Business Name *"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
                />
                <input
                  type="text"
                  name="contactPerson"
                  placeholder="Contact Person *"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address *"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
                />
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
                >
                  <option value="">Select Business Type *</option>
                  <option value="bus-operator">Bus Operator</option>
                  <option value="travel-agent">Travel Agent</option>
                  <option value="technology-partner">Technology Partner</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="text"
                  name="fleetSize"
                  placeholder="Fleet Size (if applicable)"
                  value={formData.fleetSize}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
                />
              </div>
              <input
                type="text"
                name="operatingRoutes"
                placeholder="Current Operating Routes (if applicable)"
                value={formData.operatingRoutes}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
              />
              <textarea
                name="message"
                placeholder="Tell us about your business and partnership goals"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
              ></textarea>
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-brand-primary to-purple-600 text-white px-12 py-4 rounded-lg font-bold text-lg hover:from-purple-600 hover:to-brand-primary transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Submit Partnership Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <svg className="w-12 h-12 text-brand-primary mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <h3 className="text-xl font-bold text-white mb-2">Phone</h3>
              <p className="text-white/80">+91 98765 43210</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <svg className="w-12 h-12 text-brand-primary mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <h3 className="text-xl font-bold text-white mb-2">Email</h3>
              <p className="text-white/80">partners@boardeasy.com</p>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <svg className="w-12 h-12 text-brand-primary mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <h3 className="text-xl font-bold text-white mb-2">Office</h3>
              <p className="text-white/80">Chennai, Tamil Nadu</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartnerWithUs;