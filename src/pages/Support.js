import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Support = () => {
  const [activeTab, setActiveTab] = useState('help');
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    priority: '',
    subject: '',
    description: ''
  });

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    alert('Support ticket submitted successfully! Our team will contact you within 2 hours.');
    setTicketForm({
      name: '',
      email: '',
      phone: '',
      category: '',
      priority: '',
      subject: '',
      description: ''
    });
  };

  const handleInputChange = (e) => {
    setTicketForm({
      ...ticketForm,
      [e.target.name]: e.target.value
    });
  };

  const faqData = [
    {
      question: "How do I cancel my booking?",
      answer: "You can cancel your booking up to 2 hours before departure through your dashboard or by calling our support team. Cancellation charges may apply based on the operator's policy."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept all major credit/debit cards, UPI, net banking, and digital wallets including Paytm, PhonePe, and Google Pay."
    },
    {
      question: "How do I get my refund?",
      answer: "Refunds are processed within 5-7 business days to your original payment method. You'll receive an email confirmation once the refund is initiated."
    },
    {
      question: "Can I modify my booking?",
      answer: "Yes, you can modify your booking subject to seat availability and operator policies. Modification charges may apply."
    },
    {
      question: "What if my bus is delayed?",
      answer: "You'll receive real-time updates via SMS and email. In case of significant delays, you can reschedule or get a full refund."
    }
  ];

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
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            How can we <span className="text-brand-primary">help you?</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
            Get instant support for all your travel needs. Our expert team is available 24/7 to assist you.
          </p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              {
                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
                title: "Call Support",
                subtitle: "+91 98765 43210",
                description: "Speak directly with our experts"
              },
              {
                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>,
                title: "Live Chat",
                subtitle: "Available 24/7",
                description: "Get instant help via chat"
              },
              {
                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
                title: "Email Support",
                subtitle: "support@boardeasy.com",
                description: "Send us your queries"
              },
              {
                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
                title: "Priority Support",
                subtitle: "Premium Members",
                description: "Dedicated support line"
              }
            ].map((action, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-brand-primary transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <div className="text-brand-primary mb-4">{action.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{action.title}</h3>
                <p className="text-brand-primary font-semibold mb-2">{action.subtitle}</p>
                <p className="text-white/70 text-sm">{action.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Tabs */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
            {/* Tab Navigation */}
            <div className="flex border-b border-white/20">
              {[
                { id: 'help', label: 'Help Center', icon: '❓' },
                { id: 'faq', label: 'FAQ', icon: '💬' },
                { id: 'ticket', label: 'Submit Ticket', icon: '🎫' },
                { id: 'status', label: 'Ticket Status', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-4 px-6 font-semibold transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-brand-primary text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-8">
              {activeTab === 'help' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Help Center</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      {
                        title: "Booking Issues",
                        topics: ["Payment Failed", "Seat Selection", "Booking Confirmation", "Promo Codes"],
                        icon: "🎫"
                      },
                      {
                        title: "Cancellation & Refunds",
                        topics: ["Cancel Booking", "Refund Status", "Refund Policy", "Partial Cancellation"],
                        icon: "💰"
                      },
                      {
                        title: "Travel Information",
                        topics: ["Bus Tracking", "Boarding Points", "Travel Guidelines", "COVID Protocols"],
                        icon: "🚌"
                      },
                      {
                        title: "Account Management",
                        topics: ["Profile Update", "Password Reset", "Wallet Balance", "Loyalty Points"],
                        icon: "👤"
                      },
                      {
                        title: "Technical Support",
                        topics: ["App Issues", "Website Problems", "Login Troubles", "Payment Gateway"],
                        icon: "⚙️"
                      },
                      {
                        title: "Partner Support",
                        topics: ["Operator Portal", "Commission", "Route Management", "Fleet Registration"],
                        icon: "🤝"
                      }
                    ].map((category, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-6 border border-white/10 hover:border-brand-primary transition-all duration-300">
                        <div className="text-3xl mb-4">{category.icon}</div>
                        <h3 className="text-lg font-bold text-white mb-4">{category.title}</h3>
                        <ul className="space-y-2">
                          {category.topics.map((topic, idx) => (
                            <li key={idx} className="text-white/70 hover:text-brand-primary cursor-pointer transition-colors duration-300">
                              • {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'faq' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {faqData.map((faq, index) => (
                      <div key={index} className="bg-white/5 rounded-lg border border-white/10">
                        <details className="group">
                          <summary className="p-6 cursor-pointer list-none">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-semibold text-white group-open:text-brand-primary transition-colors duration-300">
                                {faq.question}
                              </h3>
                              <svg className="w-5 h-5 text-white/70 group-open:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </summary>
                          <div className="px-6 pb-6">
                            <p className="text-white/80 leading-relaxed">{faq.answer}</p>
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'ticket' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Submit Support Ticket</h2>
                  <form onSubmit={handleTicketSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input
                        type="text"
                        name="name"
                        placeholder="Full Name *"
                        value={ticketForm.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address *"
                        value={ticketForm.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
                      />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={ticketForm.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
                      />
                      <select
                        name="category"
                        value={ticketForm.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
                      >
                        <option value="">Select Category *</option>
                        <option value="booking">Booking Issues</option>
                        <option value="payment">Payment Problems</option>
                        <option value="cancellation">Cancellation & Refunds</option>
                        <option value="technical">Technical Support</option>
                        <option value="other">Other</option>
                      </select>
                      <select
                        name="priority"
                        value={ticketForm.priority}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
                      >
                        <option value="">Priority Level *</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      name="subject"
                      placeholder="Subject *"
                      value={ticketForm.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
                    />
                    <textarea
                      name="description"
                      placeholder="Describe your issue in detail *"
                      value={ticketForm.description}
                      onChange={handleInputChange}
                      required
                      rows="6"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
                    ></textarea>
                    <div className="text-center">
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-brand-primary to-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:from-purple-600 hover:to-brand-primary transition-all duration-300 transform hover:scale-105"
                      >
                        Submit Ticket
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'status' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Check Ticket Status</h2>
                  <div className="max-w-md mx-auto">
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Enter Ticket ID"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all duration-300"
                      />
                      <button className="w-full bg-gradient-to-r from-brand-primary to-purple-600 text-white py-3 rounded-lg font-bold hover:from-purple-600 hover:to-brand-primary transition-all duration-300">
                        Check Status
                      </button>
                    </div>
                  </div>
                  <div className="mt-8 text-center">
                    <p className="text-white/70 mb-4">Don't have a ticket ID? No problem!</p>
                    <p className="text-white/60 text-sm">You can also check your ticket status by logging into your account or contacting our support team.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Other Ways to Reach Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
                title: "Visit Us",
                info: "Chennai, Tamil Nadu",
                subinfo: "Mon-Sat: 9 AM - 6 PM"
              },
              {
                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>,
                title: "Social Media",
                info: "@BoardEasyIndia",
                subinfo: "Follow for updates"
              },
              {
                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>,
                title: "WhatsApp",
                info: "+91 98765 43210",
                subinfo: "Quick support chat"
              },
              {
                icon: <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>,
                title: "Twitter",
                info: "@BoardEasy_Help",
                subinfo: "Real-time updates"
              }
            ].map((contact, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center hover:border-brand-primary transition-all duration-300">
                <div className="text-brand-primary mb-4 flex justify-center">{contact.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{contact.title}</h3>
                <p className="text-white/80 font-semibold">{contact.info}</p>
                <p className="text-white/60 text-sm mt-1">{contact.subinfo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Support;