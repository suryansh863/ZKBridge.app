"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  MessageCircle, 
  Send, 
  Clock, 
  CheckCircle,
  AlertCircle,
  User,
  MessageSquare,
  Building,
  ExternalLink
} from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Breadcrumb } from '@/components/breadcrumb';

interface ContactForm {
  name: string;
  email: string;
  category: 'technical' | 'general' | 'business' | 'security';
  subject: string;
  message: string;
}

const contactCategories = [
  { id: 'technical', label: 'Technical Support', description: 'Issues with bridging, API, or integration' },
  { id: 'general', label: 'General Inquiry', description: 'Questions about features, usage, or general information' },
  { id: 'business', label: 'Business Partnership', description: 'Partnership opportunities and enterprise solutions' },
  { id: 'security', label: 'Security Report', description: 'Security vulnerabilities or bug reports' }
];

const teamMembers = [
  {
    name: 'Alex Chen',
    role: 'Technical Lead',
    email: 'alex@zkbridge.app',
    expertise: 'Zero-Knowledge Proofs, Blockchain Security'
  },
  {
    name: 'Sarah Johnson',
    role: 'Product Manager',
    email: 'sarah@zkbridge.app',
    expertise: 'Product Strategy, User Experience'
  },
  {
    name: 'Mike Rodriguez',
    role: 'Security Engineer',
    email: 'mike@zkbridge.app',
    expertise: 'Smart Contract Security, Auditing'
  }
];

export default function ContactPage() {
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    category: 'general',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would send the form data to your backend
      console.log('Form submitted:', form);
      
      setSubmitStatus('success');
      setForm({
        name: '',
        email: '',
        category: 'general',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Contact Us' }
          ]}
          className="mb-8"
        />

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get in touch with our team for support, partnerships, or any questions about ZKBridge.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50">
              <div className="flex items-center mb-6">
                <MessageSquare className="h-6 w-6 text-blue-500 mr-3" />
                <h2 className="text-2xl font-bold text-white">Send us a message</h2>
              </div>

              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg"
                >
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <p className="text-green-400">Message sent successfully! We&apos;ll get back to you within 24 hours.</p>
                  </div>
                </motion.div>
              )}

              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg"
                >
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                    <p className="text-red-400">Failed to send message. Please try again or contact us directly.</p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                        placeholder="Your name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                  >
                    {contactCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-400 mt-1">
                    {contactCategories.find(c => c.id === form.category)?.description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none"
                    placeholder="Please provide as much detail as possible..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Response Times */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-blue-500 mr-3" />
                <h3 className="text-lg font-semibold text-white">Response Times</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Technical Support</span>
                  <span className="text-white text-sm font-medium">24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">General Inquiry</span>
                  <span className="text-white text-sm font-medium">48 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Business Partnership</span>
                  <span className="text-white text-sm font-medium">72 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300 text-sm">Security Report</span>
                  <span className="text-white text-sm font-medium">12 hours</span>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center mb-4">
                <Building className="h-5 w-5 text-green-500 mr-3" />
                <h3 className="text-lg font-semibold text-white">Our Team</h3>
              </div>
              <div className="space-y-4">
                {teamMembers.map((member, index) => (
                  <div key={index} className="border-b border-gray-700/50 pb-4 last:border-b-0 last:pb-0">
                    <h4 className="text-white font-medium">{member.name}</h4>
                    <p className="text-blue-400 text-sm">{member.role}</p>
                    <p className="text-gray-400 text-xs mt-1">{member.expertise}</p>
                    <a
                      href={`mailto:${member.email}`}
                      className="text-gray-300 text-xs hover:text-blue-400 transition-colors"
                    >
                      {member.email}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Alternative Contact Methods */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <div className="flex items-center mb-4">
                <MessageCircle className="h-5 w-5 text-purple-500 mr-3" />
                <h3 className="text-lg font-semibold text-white">Other Ways to Reach Us</h3>
              </div>
              <div className="space-y-3">
                <a
                  href="https://discord.gg/zkbridge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-3" />
                  <span className="text-sm">Discord Community</span>
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
                <a
                  href="https://twitter.com/zkbridge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-3" />
                  <span className="text-sm">Twitter</span>
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
                <a
                  href="https://github.com/zkbridge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-3" />
                  <span className="text-sm">GitHub</span>
                  <ExternalLink className="h-3 w-3 ml-2" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
