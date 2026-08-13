/**
 * Lead view modal — displays full lead details with tabs for
 * Details, Notes, and Activity Timeline. Supports file attachment download.
 */

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { addNoteAPI, getNotesAPI, getTimelineAPI, downloadAttachmentAPI } from '../services/api';

const TABS = ['Details', 'Notes', 'Timeline'];

function LeadViewModal({ lead, onClose }) {
  const [activeTab, setActiveTab] = useState('Details');
  const [notes, setNotes] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!lead) return null;

  const statusColors = {
    New: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Contacted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Closed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  };

  const getFileIcon = (filename) => {
    if (!filename) return '📎';
    const ext = filename.split('.').pop().toLowerCase();
    switch (ext) {
      case 'pdf': return '📄';
      case 'png': case 'jpg': case 'jpeg': return '🖼️';
      case 'doc': case 'docx': return '📝';
      default: return '📎';
    }
  };

  const fetchNotes = async () => {
    setLoadingNotes(true);
    try {
      const data = await getNotesAPI(lead._id);
      setNotes(data.notes || []);
    } catch {
      setNotes([]);
    } finally {
      setLoadingNotes(false);
    }
  };

  const fetchTimeline = async () => {
    setLoadingTimeline(true);
    try {
      const data = await getTimelineAPI(lead._id);
      setTimeline(data.timeline || []);
    } catch {
      setTimeline([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Notes') fetchNotes();
    if (activeTab === 'Timeline') fetchTimeline();
  }, [activeTab]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await addNoteAPI(lead._id, newNote.trim());
      toast.success('Note added');
      setNewNote('');
      fetchNotes();
    } catch {
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await downloadAttachmentAPI(lead._id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = lead.attachment_filename || 'attachment';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download attachment');
    } finally {
      setDownloading(false);
    }
  };

  const formatDateTime = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-white dark:bg-surface-card-dark rounded-2xl shadow-2xl border border-border dark:border-border-dark animate-fade-in-up max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border dark:border-border-dark flex-shrink-0">
          <h3 className="text-lg font-bold text-text-primary dark:text-text-dark-primary">
            Lead Details
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border dark:border-border-dark flex-shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-text-secondary dark:text-text-dark-secondary hover:text-text-primary dark:hover:text-text-dark-primary hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Details Tab */}
          {activeTab === 'Details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-1">Name</p>
                  <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">{lead.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">{lead.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-1">Budget</p>
                  <p className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">{lead.budget}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[lead.status] || ''}`}>
                    {lead.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-1">Message</p>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-sm text-text-primary dark:text-text-dark-primary leading-relaxed whitespace-pre-wrap">
                    {lead.message}
                  </p>
                </div>
              </div>

              {/* Attachment */}
              {lead.attachment_filename && (
                <div>
                  <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-1">Attachment</p>
                  <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl flex-shrink-0">{getFileIcon(lead.attachment_filename)}</span>
                      <p className="text-sm font-medium text-text-primary dark:text-text-dark-primary truncate">
                        {lead.attachment_filename}
                      </p>
                    </div>
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {downloading ? '...' : '⬇ Download'}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-1">Submitted At</p>
                <p className="text-sm text-text-primary dark:text-text-dark-primary">
                  {formatDateTime(lead.created_at)}
                </p>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'Notes' && (
            <div className="space-y-4">
              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-3 py-2 rounded-lg border border-border dark:border-border-dark bg-white dark:bg-gray-800 text-sm text-text-primary dark:text-text-dark-primary placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="submit"
                  disabled={addingNote || !newNote.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {addingNote ? '...' : 'Add'}
                </button>
              </form>

              {/* Notes List */}
              {loadingNotes ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">📝</p>
                  <p className="text-sm text-text-secondary dark:text-text-dark-secondary">No notes yet. Add one above.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.slice().reverse().map((note, i) => (
                    <div key={note.id || i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                      <p className="text-sm text-text-primary dark:text-text-dark-primary">{note.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-text-secondary dark:text-text-dark-secondary">{note.author}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-text-secondary dark:text-text-dark-secondary">{formatDateTime(note.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'Timeline' && (
            <div>
              {loadingTimeline ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : timeline.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">📋</p>
                  <p className="text-sm text-text-secondary dark:text-text-dark-secondary">No activity recorded.</p>
                </div>
              ) : (
                <div className="relative pl-6">
                  {/* Timeline line */}
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-border dark:bg-border-dark" />

                  <div className="space-y-4">
                    {timeline.slice().reverse().map((entry, i) => (
                      <div key={i} className="relative">
                        {/* Dot */}
                        <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white dark:border-surface-card-dark ${
                          entry.action === 'Lead Created' ? 'bg-emerald-500' :
                          entry.action === 'Status Changed' ? 'bg-amber-500' :
                          entry.action === 'Note Added' ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />

                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-text-primary dark:text-text-dark-primary uppercase tracking-wider">
                              {entry.action}
                            </span>
                            <span className="text-xs text-text-secondary dark:text-text-dark-secondary">
                              {formatDateTime(entry.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary dark:text-text-dark-secondary">{entry.detail}</p>
                          <p className="text-xs text-gray-400 mt-1">by {entry.actor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border dark:border-border-dark flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-text-primary dark:text-text-dark-primary font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeadViewModal;
