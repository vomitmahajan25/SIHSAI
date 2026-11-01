'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  Upload,
  FileText,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  FileCheck,
  Shield,
} from 'lucide-react';
import { api } from '@/lib/api';
import { VaultDocument } from '@/types';
import Modal from '@/components/ui/Modal';
import { formatDateIndian } from '@/lib/formatters';

export default function DigitalVaultPage() {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState('receipt');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments();
      setDocuments(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError('Selected file exceeds the 10MB maximum limit.');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose a file to upload.');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', category);
      if (notes) formData.append('notes', notes);

      await api.uploadDocument(formData);
      setIsUploadOpen(false);
      setSelectedFile(null);
      setNotes('');
      fetchDocuments();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document from the vault?')) {
      try {
        await api.deleteDocument(id);
        fetchDocuments();
      } catch (err: any) {
        alert(err.message || 'Failed to delete document.');
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-ink-primary tracking-tight">
            Digital Vault (दस्तावेज़ तिजोरी)
          </h2>
          <p className="text-xs text-ink-secondary mt-0.5">
            Store supplier receipts, Udyam certificates, and loan documents in private object storage
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <Upload className="w-4 h-4 text-lime" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Security Info Banner */}
      <div className="p-4 rounded-2xl bg-surface border border-stroke flex items-start gap-3 shadow-xs">
        <Shield className="w-5 h-5 text-sage flex-shrink-0 mt-0.5" />
        <div className="text-xs text-ink-secondary leading-relaxed">
          <strong className="text-ink-primary">Enterprise Vault Security:</strong> All uploaded files are isolated per entrepreneur. Access requires authenticated Bearer session tokens with short-lived download authorization. No raw files are ever exposed publicly.
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-ink-secondary text-sm">
            Loading your digital vault records...
          </div>
        ) : documents.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-ink-secondary text-sm bg-surface rounded-2xl border border-stroke">
            Your digital vault is currently empty. Upload your first invoice, license, or receipt!
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-surface rounded-2xl p-5 border border-stroke shadow-sm hover:border-sage/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-9 h-9 rounded-xl bg-canvas flex items-center justify-center text-sage border border-stroke flex-shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-canvas text-ink-secondary uppercase tracking-wider">
                    {doc.category}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-ink-primary truncate" title={doc.filename}>
                    {doc.filename}
                  </h4>
                  <p className="text-[11px] text-ink-secondary">
                    {formatFileSize(doc.file_size)} • {formatDateIndian(doc.created_at)}
                  </p>
                </div>

                {doc.notes && (
                  <p className="text-xs text-ink-secondary line-clamp-2 bg-canvas p-2 rounded-lg">
                    {doc.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-stroke flex items-center justify-between text-xs">
                <a
                  href={api.getDocumentDownloadUrl(doc.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-sage hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1 rounded-lg text-ink-secondary hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Store Document in Vault"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Select File (PDF, PNG, JPEG up to 10MB) *
            </label>
            <input
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              className="w-full text-xs text-ink-secondary file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-forest file:text-white hover:file:bg-forest-light cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Document Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            >
              <option value="receipt">Invoice / Supplier Purchase Receipt</option>
              <option value="license">Trade License / Gram Panchayat NOC</option>
              <option value="id_proof">Aadhaar / Voter ID / PAN</option>
              <option value="loan_doc">Loan Agreement / Bank Passbook</option>
              <option value="other">Other Official Business Record</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1">
              Notes or Invoice Details (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Rice procurement bill from APMC Mandi, Invoice #481"
              className="w-full px-3 py-2 bg-canvas border border-stroke rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage"
            />
          </div>

          <div className="pt-3 border-t border-stroke flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="px-4 py-2 rounded-xl border border-stroke text-ink-secondary text-xs font-semibold hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-sm disabled:opacity-50"
            >
              {uploading ? 'Storing Safely...' : 'Upload & Encrypt'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
