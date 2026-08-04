"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Users, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string | null;
  createdAt: string;
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: ''
  });

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleOpenModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        mobile: contact.mobile || ''
      });
    } else {
      setEditingContact(null);
      setFormData({ firstName: '', lastName: '', email: '', mobile: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) return;

    try {
      const url = editingContact ? `/api/v1/contacts/${editingContact.id}` : '/api/v1/contacts';
      const method = editingContact ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchContacts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save contact');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      const res = await fetch(`/api/v1/contacts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setContacts(contacts.filter(c => c.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete contact');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.firstName.toLowerCase().includes(search.toLowerCase()) ||
    c.lastName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              Audience
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Manage your email marketing contacts</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>

        <div className="bg-[#151515]/60 backdrop-blur-xl border border-[#2E2E3E]/50 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading contacts...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border border-[#2E2E3E] rounded-xl border-dashed">
                <Users className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>No contacts found.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-[#1A1A24] text-white">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-lg font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Mobile</th>
                    <th className="px-6 py-4 font-medium">Added</th>
                    <th className="px-6 py-4 rounded-tr-lg font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2E2E3E]">
                  {filteredContacts.map(contact => (
                    <tr key={contact.id} className="hover:bg-[#1A1A24]/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{contact.firstName} {contact.lastName}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          {contact.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {contact.mobile ? (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            {contact.mobile}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleOpenModal(contact)} className="p-2 hover:bg-[#2E2E3E] rounded-md transition-colors text-blue-400 mr-2">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(contact.id)} className="p-2 hover:bg-red-500/20 rounded-md transition-colors text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#151515] border border-[#2E2E3E] rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{editingContact ? 'Edit Contact' : 'New Contact'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">First Name *</label>
                    <input
                      required
                      type="text"
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Last Name (Surname) *</label>
                    <input
                      required
                      type="text"
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Mobile Number (Optional)</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={e => setFormData({...formData, mobile: e.target.value})}
                    className="w-full bg-[#0A0A0F] border border-[#2E2E3E] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-[#1A1A24] text-gray-300 hover:bg-[#252535]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.firstName || !formData.lastName || !formData.email}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Save Contact
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
