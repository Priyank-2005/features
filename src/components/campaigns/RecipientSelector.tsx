"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, CheckSquare, Square, Users } from "lucide-react";
import { motion } from "framer-motion";

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string | null;
};

interface RecipientSelectorProps {
  campaignId: string;
  onRecipientsChange: (selectedIds: string[]) => void;
}

export function RecipientSelector({ campaignId, onRecipientsChange }: RecipientSelectorProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchContacts = async () => {
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

  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const searchLower = search.toLowerCase();
    return fullName.includes(searchLower) || contact.email.toLowerCase().includes(searchLower);
  });

  const handleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
      onRecipientsChange([]);
    } else {
      const allIds = new Set(filteredContacts.map(c => c.id));
      setSelectedIds(allIds);
      onRecipientsChange(Array.from(allIds));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    onRecipientsChange(Array.from(newSelected));
  };

  return (
    <div className="glass-panel flex flex-col h-[600px]">
      <div className="p-4 border-b border-[#2E2E3E]/50 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium font-playfair flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Select Audience
          </h3>
          <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full text-blue-400 text-xs font-medium">
            {selectedIds.size} Selected
          </div>
        </div>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#151515] border border-[#2E2E3E] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Filter className="w-8 h-8 mb-2 opacity-20" />
            <p>No contacts found matching criteria.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="sticky top-0 bg-[#1E1E2E] text-xs uppercase text-gray-400 border-b border-[#2E2E3E]/50 z-10">
              <tr>
                <th scope="col" className="px-4 py-3 w-12">
                  <button onClick={handleSelectAll} className="text-gray-400 hover:text-white focus:outline-none flex items-center justify-center">
                    {selectedIds.size === filteredContacts.length && filteredContacts.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th scope="col" className="px-4 py-3 font-medium">Name</th>
                <th scope="col" className="px-4 py-3 font-medium">Email</th>
                <th scope="col" className="px-4 py-3 font-medium">Mobile</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact, i) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  key={contact.id} 
                  className={`border-b border-[#2E2E3E]/50 hover:bg-[#1E1E2E]/40 transition-colors cursor-pointer ${selectedIds.has(contact.id) ? 'bg-indigo-500/5' : ''}`}
                  onClick={() => handleSelectOne(contact.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      {selectedIds.has(contact.id) ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{contact.firstName} {contact.lastName}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{contact.email}</td>
                  <td className="px-4 py-3 text-gray-400">{contact.mobile || "-"}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
