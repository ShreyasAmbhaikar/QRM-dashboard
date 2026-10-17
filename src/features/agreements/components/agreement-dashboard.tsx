'use client';

import React, { useState, useEffect } from 'react';
import { 
  AgreementWithClient, 
  updateAgreement, 
  signAgreementAction, 
  createDefaultAgreementAction,
  getPublicAgreementById,
  getAgreementHistoryAction,
  deleteAgreementSignatureAction,
  resetAgreementToDefaultAction
} from '../actions';
import { SignatureCanvas } from './signature-canvas';
import { AgreementPreview } from './agreement-preview';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Save, 
  FileSignature,
  Plus,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Globe,
  Phone,
  Mail,
  RefreshCw,
  History,
  LayoutDashboard,
  Undo,
  Redo,
  ArrowUp,
  ArrowDown,
  Trash,
  ChevronDown,
  ChevronUp,
  Eye,
  RotateCcw,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface AgreementDashboardProps {
  initialAgreement: AgreementWithClient;
  clients: { id: string; name: string; domain: string }[];
}

const CustomTable = Table.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

const CustomTableRow = TableRow.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        },
      },
    };
  },
});

interface PageEditorProps {
  initialContent: string;
  onChange: (html: string) => void;
  onFocus: (editorInstance: any) => void;
}

const PageEditor = React.memo(({ initialContent, onChange, onFocus }: PageEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      CustomTable.configure({
        resizable: false,
      }),
      CustomTableRow,
      CustomTableHeader,
      CustomTableCell,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: () => {
      if (editor) onFocus(editor);
    }
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  return (
    <div className="editor-container w-full h-full overflow-y-auto pr-1">
      <EditorContent editor={editor} />
    </div>
  );
});
PageEditor.displayName = 'PageEditor';

export function AgreementDashboard({ initialAgreement, clients }: AgreementDashboardProps) {
  const router = useRouter();
  const [agreement, setAgreement] = useState<AgreementWithClient>(initialAgreement);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isClean, setIsClean] = useState(true);
  const [activeTab, setActiveTab] = useState<'workspace' | 'history'>('workspace');
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Split and manage pages array dynamically
  const [pages, setPages] = useState<string[]>([]);
  
  // Track active editor instance for toolbar actions
  const [activeEditorInstance, setActiveEditorInstance] = useState<any>(null);
  const [activeEditorIndex, setActiveEditorIndex] = useState<number>(0);

  // Signature Dialog controls
  const [signingRole, setSigningRole] = useState<'CLIENT' | 'PROVIDER' | null>(null);
  const [isSignOpen, setIsSignOpen] = useState(false);

  // Form edit metadata states
  const [editMetadata, setEditMetadata] = useState({
    title: agreement.title,
    monthlyFee: agreement.monthlyFee,
    startDate: new Date(agreement.startDate).toISOString().split('T')[0],
    endDate: agreement.endDate ? new Date(agreement.endDate).toISOString().split('T')[0] : '',
    companyName: agreement.companyName || 'Quantum Reach Media',
    companyEmail: agreement.companyEmail || 'tushar7738812028@gmail.com',
    companyPhone: agreement.companyPhone || '+91 77388 12028',
    companyWebsite: agreement.companyWebsite || 'quantumreachmedia.com',
    deliverables: Array.isArray(agreement.deliverables) ? (agreement.deliverables as string[]) : [],
  });

  const [openSections, setOpenSections] = useState({
    execution: true,
    pageManager: false,
    financial: false,
    branding: false,
  });

  // Debounced Auto-Save Effect
  useEffect(() => {
    if (isClean || loading || !pages || pages.length === 0) return;

    const timer = setTimeout(async () => {
      const combinedHtml = pages.join('<hr />');
      try {
        const res = await updateAgreement({
          id: agreement.id,
          title: editMetadata.title,
          monthlyFee: Number(editMetadata.monthlyFee),
          startDate: editMetadata.startDate,
          endDate: editMetadata.endDate || undefined,
          content: combinedHtml,
          companyName: editMetadata.companyName,
          companyEmail: editMetadata.companyEmail,
          companyPhone: editMetadata.companyPhone,
          companyWebsite: editMetadata.companyWebsite,
          deliverables: editMetadata.deliverables,
        });

        if (res.success && res.data) {
          setAgreement((prev) => ({
            ...prev,
            ...res.data,
          }));
          setIsClean(true);
        }
      } catch (err) {
        console.error("Auto-save error:", err);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [pages, editMetadata, isClean, loading, agreement.id]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const { success: toastSuccess, error: toastError } = useToast();

  const convertPlainTextToTable = (html: string) => {
    if (html.includes('Service Provider:') && !html.includes('Service Provider</th>')) {
      const targetRegex = /This Agreement is made on[\s\S]*?Address: ____________________/i;
      
      const tableHtml = `<table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-top: 10px; margin-bottom: 16px;">
  <thead>
    <tr style="background-color: #faf5ff; border-bottom: 1px solid #cbd5e1;">
      <th style="width: 50%; border-right: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold; color: #581c87; font-size: 9.5px; text-transform: uppercase;">Service Provider</th>
      <th style="width: 50%; padding: 8px; text-align: left; font-weight: bold; color: #581c87; font-size: 9.5px; text-transform: uppercase;">Client Details</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="width: 50%; border-right: 1px solid #cbd5e1; padding: 10px; vertical-align: top; color: #334155; font-size: 9px; line-height: 1.4;">
        <strong>Company Name:</strong> Quantum Reach Media<br />
        <strong>Address:</strong> _________________________________
      </td>
      <td style="width: 50%; padding: 10px; vertical-align: top; color: #334155; font-size: 9px; line-height: 1.4;">
        <strong>Client Name:</strong> Dr. Chintan Gujarathi<br />
        <strong>Business Name:</strong> Dr. Chintan Gujarathi – Plastic & Cosmetic Surgery Clinic<br />
        <strong>Address:</strong> _________________________________
      </td>
    </tr>
  </tbody>
</table>`;

      return html.replace(targetRegex, `This Agreement is made on <strong>____________________</strong> between:${tableHtml}`);
    }
    return html;
  };

  // Populate pages array from agreement content on load
  useEffect(() => {
    if (agreement.content) {
      const fixedContent = convertPlainTextToTable(agreement.content);
      if (fixedContent !== agreement.content) {
        setIsClean(false);
      }
      setPages(fixedContent.split(/<hr\b[^>]*>/i));
    }
  }, [agreement.content]);

  // Load audit logs history dynamically when tab is selected
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getAgreementHistoryAction(agreement.id);
        if (res.success && res.data) {
          setHistoryLogs(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch agreement history:', err);
      }
    };

    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, agreement.id]);

  const handleCopyLink = () => {
    const signUrl = `${window.location.protocol}//${window.location.host}/agreements/sign/${agreement.id}`;
    navigator.clipboard.writeText(signUrl);
    setCopied(true);
    toastSuccess('Link Copied', 'Secure signature link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateNew = async () => {
    setLoading(true);
    try {
      const res = await createDefaultAgreementAction();
      if (res.success && res.data) {
        toastSuccess('Contract Created', 'New service agreement draft spawned successfully!');
        router.push(`/dashboard/agreements/${res.data.id}`);
      } else {
        toastError('Creation Failed', !res.success ? res.error.message : 'Failed to create agreement.');
      }
    } catch (err: any) {
      toastError('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTerms = async () => {
    setLoading(true);
    const combinedHtml = pages.join('<hr />');

    try {
      const res = await updateAgreement({
        id: agreement.id,
        title: editMetadata.title,
        monthlyFee: Number(editMetadata.monthlyFee),
        startDate: editMetadata.startDate,
        endDate: editMetadata.endDate || undefined,
        content: combinedHtml,
        companyName: editMetadata.companyName,
        companyEmail: editMetadata.companyEmail,
        companyPhone: editMetadata.companyPhone,
        companyWebsite: editMetadata.companyWebsite,
        deliverables: editMetadata.deliverables,
      });

      if (res.success && res.data) {
        setAgreement({
          ...agreement,
          ...res.data,
        });
        setIsClean(true);
        toastSuccess('Contract Saved', 'Agreement changes saved and synced successfully!');
      } else {
        toastError('Save Failed', !res.success ? res.error.message : 'Failed to save agreement.');
      }
    } catch (err: any) {
      toastError('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm('Are you sure you want to reset this agreement back to the default template? This will erase all current text edits, reset any signatures, and cannot be undone.')) {
      return;
    }
    setLoading(true);
    try {
      const res = await resetAgreementToDefaultAction(agreement.id);
      if (res.success && res.data) {
        setAgreement({
          ...agreement,
          ...res.data,
        });
        const contentPages = res.data.content.split(/<hr\b[^>]*>/i);
        setPages(contentPages);
        setEditMetadata({
          title: res.data.title,
          monthlyFee: res.data.monthlyFee,
          startDate: new Date(res.data.startDate).toISOString().split('T')[0],
          endDate: res.data.endDate ? new Date(res.data.endDate).toISOString().split('T')[0] : '',
          companyName: res.data.companyName || 'Quantum Reach Media',
          companyEmail: res.data.companyEmail || 'tushar7738812028@gmail.com',
          companyPhone: res.data.companyPhone || '+91 77388 12028',
          companyWebsite: res.data.companyWebsite || 'quantumreachmedia.com',
          deliverables: Array.isArray(res.data.deliverables) ? (res.data.deliverables as string[]) : [],
        });
        setIsClean(true);
        toastSuccess('Template Restored', 'The agreement has been reset to the default template successfully.');
        router.refresh();
      } else {
        toastError('Reset Failed', !res.success ? res.error.message : 'Failed to reset agreement.');
      }
    } catch (err: any) {
      toastError('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignClick = (role: 'CLIENT' | 'PROVIDER') => {
    setSigningRole(role);
    setIsSignOpen(true);
  };

  const handleSaveSignature = async (signatureDataUrl: string, name: string) => {
    if (!signingRole) return;

    setLoading(true);
    try {
      const res = await signAgreementAction(agreement.id, signingRole, signatureDataUrl, name);
      if (res.success && res.data) {
        setAgreement({
          ...agreement,
          ...res.data,
        });
        toastSuccess('Signature Saved', `${signingRole === 'CLIENT' ? 'Client' : 'Provider'} signature saved!`);
        setIsSignOpen(false);
      } else {
        toastError('Signature Failed', !res.success ? res.error.message : 'Failed to save signature.');
      }
    } catch (err: any) {
      toastError('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSignature = async (role: 'CLIENT' | 'PROVIDER') => {
    setLoading(true);
    try {
      const res = await deleteAgreementSignatureAction(agreement.id, role);
      if (res.success && res.data) {
        setAgreement({
          ...agreement,
          ...res.data,
        });
        toastSuccess('Signature Reset', `${role === 'CLIENT' ? 'Client' : 'Provider'} signature deleted successfully.`);
      } else {
        toastError('Delete Failed', !res.success ? res.error.message : 'Failed to reset signature.');
      }
    } catch (err: any) {
      toastError('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncStatus = async () => {
    setLoading(true);
    try {
      const res = await getPublicAgreementById(agreement.id);
      if (res.success && res.data) {
        setAgreement(res.data);
        toastSuccess('Signatures Synced', 'Latest signature status fetched from database!');
      } else {
        toastError('Sync Failed', 'Failed to retrieve latest signature status.');
      }
    } catch (err: any) {
      toastError('Error', err.message || 'Failed to sync signature status.');
    } finally {
      setLoading(false);
    }
  };

  // Tool bar formatting helpers
  const toggleBold = () => activeEditorInstance?.chain().focus().toggleBold().run();
  const toggleItalic = () => activeEditorInstance?.chain().focus().toggleItalic().run();
  const toggleUnderline = () => activeEditorInstance?.chain().focus().toggleUnderline().run();
  const toggleBulletList = () => activeEditorInstance?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => activeEditorInstance?.chain().focus().toggleOrderedList().run();
  const toggleHeading = (level: 1 | 2 | 3) => activeEditorInstance?.chain().focus().toggleHeading({ level }).run();
  const applyColor = (color: string) => activeEditorInstance?.chain().focus().setColor(color).run();

  const isFullySigned = agreement.status === 'SIGNED';
  const signingLink = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/agreements/sign/${agreement.id}` : '';

  const colors = [
    { name: 'Dark Purple', value: '#581c87' },
    { name: 'Light Purple', value: '#a78bfa' },
    { name: 'Slate Gray', value: '#475569' },
    { name: 'Emerald Green', value: '#059669' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Default Black', value: '#0f172a' }
  ];

  // Audit Logs summary calculations
  const exportLogs = historyLogs.filter(log => log.action === 'EXPORT');
  const lastDownloadLog = historyLogs.find(log => log.action === 'EXPORT');
  const lastDownloadTime = lastDownloadLog ? new Date(lastDownloadLog.createdAt).toLocaleString() : 'Never downloaded';

  return (
    <div className="space-y-6">
      {/* Top dashboard control header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex-1 max-w-xl">
          <div className="flex items-center gap-2.5 text-muted-foreground focus-within:text-purple-400 group">
            <FileText className="h-5 w-5 text-purple-700 shrink-0" />
            <input
              type="text"
              value={editMetadata.title}
              onChange={(e) => {
                setEditMetadata({ ...editMetadata, title: e.target.value });
                setIsClean(false);
              }}
              className="bg-transparent border-none outline-none font-bold text-lg text-foreground focus:ring-0 w-full p-0 leading-tight border-b border-transparent focus:border-purple-500/30 transition-all font-sans"
              placeholder="Contract Title"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 relative">
          <span className="text-[10px] text-muted-foreground mr-1">
            {loading ? 'Saving...' : isClean ? 'All changes saved' : 'Unsaved changes...'}
          </span>

          <Button
            onClick={handleSaveTerms}
            disabled={loading || isClean}
            size="sm"
            className={`gap-1.5 text-xs text-white shadow font-semibold transition-all ${
              isClean 
                ? 'bg-muted-foreground/20 text-muted-foreground border border-border cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Save className="h-4 w-4" /> Save
          </Button>

          <Button
            onClick={() => setIsPreviewOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs text-foreground font-semibold"
          >
            <Eye className="h-4 w-4" /> Preview
          </Button>

          <Link href={`/api/agreements/${agreement.id}/pdf`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-foreground font-semibold">
              <Download className="h-4 w-4" /> Download
            </Button>
          </Link>

          <div className="relative">
            <Button
              onClick={() => setOptionsOpen(!optionsOpen)}
              variant="outline"
              size="icon"
              className="h-9 w-9 text-foreground cursor-pointer"
              title="Options"
            >
              <Settings className="h-4 w-4" />
            </Button>
            {optionsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-45" 
                  onClick={() => setOptionsOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-48 bg-card border border-border rounded-xl shadow-xl p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-100">
                  <button
                    onClick={() => {
                      setOptionsOpen(false);
                      handleCreateNew();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted/50 rounded-lg flex items-center gap-2 cursor-pointer font-medium border-none bg-transparent"
                  >
                    <Plus className="h-3.5 w-3.5 text-purple-500 animate-in spin-in-12 duration-300" /> Create New Contract
                  </button>
                  <button
                    onClick={() => {
                      setOptionsOpen(false);
                      handleResetToDefault();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 rounded-lg flex items-center gap-2 cursor-pointer font-medium border-none bg-transparent"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-red-500" /> Reset to Default
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Selector (Workspace vs History) */}
      <div className="flex bg-muted/20 border border-border p-1 rounded-xl w-fit gap-1">
        <button
          onClick={() => setActiveTab('workspace')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'workspace'
              ? 'bg-purple-700 text-white shadow'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" /> Agreement Workspace
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-purple-700 text-white shadow'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <History className="h-3.5 w-3.5" /> Export History
        </button>
      </div>

      {activeTab === 'workspace' ? (
        <>
          {/* Editor Formatting Sticky Panel */}
          <div className="sticky top-14 z-10 flex flex-wrap items-center gap-1.5 p-2 bg-card border border-border rounded-xl shadow-md">
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700 px-2 border-r border-border mr-1">
              Page {activeEditorIndex + 1} Editor
            </span>

            {/* Undo & Redo Buttons */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-foreground"
              onClick={() => activeEditorInstance?.chain().focus().undo().run()}
              disabled={!activeEditorInstance || !activeEditorInstance.can().undo()}
              title="Undo"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-foreground"
              onClick={() => activeEditorInstance?.chain().focus().redo().run()}
              disabled={!activeEditorInstance || !activeEditorInstance.can().redo()}
              title="Redo"
            >
              <Redo className="h-4 w-4" />
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Formatting Buttons */}
            <Button
              type="button"
              variant={activeEditorInstance?.isActive('bold') ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 text-foreground"
              onClick={toggleBold}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={activeEditorInstance?.isActive('italic') ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 text-foreground"
              onClick={toggleItalic}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={activeEditorInstance?.isActive('underline') ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 text-foreground"
              onClick={toggleUnderline}
              title="Underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* List Buttons */}
            <Button
              type="button"
              variant={activeEditorInstance?.isActive('bulletList') ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 text-foreground"
              onClick={toggleBulletList}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={activeEditorInstance?.isActive('orderedList') ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 text-foreground"
              onClick={toggleOrderedList}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Headings */}
            <Button
              type="button"
              variant={activeEditorInstance?.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 text-foreground"
              onClick={() => toggleHeading(1)}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={activeEditorInstance?.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 text-foreground"
              onClick={() => toggleHeading(2)}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={activeEditorInstance?.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 text-foreground"
              onClick={() => toggleHeading(3)}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </Button>

            <div className="h-4 w-px bg-border mx-1" />

            {/* Text Color Picker */}
            <div className="flex items-center gap-1">
              <Palette className="h-3.5 w-3.5 text-muted-foreground mr-1" />
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => applyColor(c.value)}
                  className="h-5 w-5 rounded-full border border-border cursor-pointer transition-all hover:scale-110 active:scale-95"
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
{/* Main Editor/Workspace split layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Editable A4 Sheets (ALWAYS Rendered in Paper-White layout) */}
            <div className="lg:col-span-2 space-y-4 select-none py-6 bg-[#09090b] rounded-2xl border border-border p-2 sm:p-4 flex flex-col items-center w-full overflow-hidden">
              <div className="flex flex-col items-center gap-4 w-full">
                {pages.map((pageHtml, index) => {
                const pageNumber = index + 1;
                const totalPages = pages.length;
                const isLastPage = pageNumber === totalPages;

                return (
                  <div key={index} className="w-full flex justify-center overflow-hidden h-[960px]">
                    <div 
                      className="relative w-[794px] h-[1123px] bg-white text-slate-800 border border-slate-200 shadow-xl rounded-xl p-12 pb-20 flex flex-col justify-between overflow-hidden shrink-0 origin-top scale-[0.83]"
                    >
                      {/* Top-Right Decorative Slanted Triangle */}
                      <div 
                        className="absolute top-0 right-0 w-[120px] h-[120px] bg-[#581c87] z-10" 
                        style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
                      />
                      
                      <div>
                        {/* Header Page */}
                        <div className="relative flex justify-between items-center border-b border-[#a78bfa] pb-3 mb-4 z-20">
                          
                          <div className="flex items-center gap-4">
                            <img src="/qrm-logo.png" alt="QRM Logo" className="h-12 object-contain shrink-0" />
                            <div className="flex flex-col text-left">
                              <span className="font-extrabold text-[15px] leading-none tracking-tight text-[#581c87] font-sans">
                                Quantum Reach
                              </span>
                              <span className="font-bold text-[9px] leading-none tracking-[0.25em] text-[#7c3aed] uppercase mt-1 font-sans">
                                Media
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-0.5 text-[8.5px] text-[#475569] font-medium mr-24 z-20">
                            <div className="flex items-center gap-1 justify-end">
                              <span>{editMetadata.companyWebsite || 'quantumreachmedia.com'}</span>
                              <div className="p-0.5 rounded bg-[#581c87] text-white">
                                <Globe className="h-2 w-2" />
                              </div>
                            </div>
                            <div className="flex items-center gap-1 justify-end">
                              <span>{editMetadata.companyPhone || '+91 77388 12028'}</span>
                              <div className="p-0.5 rounded bg-[#581c87] text-white">
                                <Phone className="h-2 w-2" />
                              </div>
                            </div>
                            <div className="flex items-center gap-1 justify-end">
                              <span>{editMetadata.companyEmail || 'tushar7738812028@gmail.com'}</span>
                              <div className="p-0.5 rounded bg-[#581c87] text-white">
                                <Mail className="h-2 w-2" />
                              </div>
                            </div>
                          </div>
                        </div>

                      {pageNumber === 1 && (
                        <div className="text-center py-2">
                          <h1 className="text-lg font-extrabold text-[#581c87] tracking-wider uppercase">
                            Service Agreement
                          </h1>
                        </div>
                      )}

                      {/* Content editor styled inside strict height */}
                      <div className="flex-1 overflow-y-auto min-h-0 pr-1 mt-4 max-h-[720px]">
                        <PageEditor 
                          initialContent={pageHtml}
                          onChange={(newHtml) => {
                            const updated = [...pages];
                            updated[index] = newHtml;
                            setPages(updated);
                            setIsClean(false);
                          }}
                          onFocus={(editorInstance) => {
                            setActiveEditorInstance(editorInstance);
                            setActiveEditorIndex(index);
                          }}
                        />
                      </div>
                    </div>

                    {/* Acceptance of Terms bordered signature table (Matches Image 2 exactly) */}
                    {isLastPage && (
                      <div className="mt-8 space-y-3 bg-white">
                        <h3 className="text-[10px] font-bold text-[#581c87] border-b border-border pb-1 uppercase tracking-wider">
                          Acceptance of Terms
                        </h3>
                        
                        <table className="w-full border-collapse border border-[#cbd5e1] text-[9.5px] text-[#334155] bg-white">
                          <thead>
                            <tr className="bg-[#faf5ff] text-[#581c87] border-b border-[#cbd5e1]">
                              <th className="border-r border-[#cbd5e1] p-2 text-left font-bold uppercase tracking-wider w-1/2">Client Signature</th>
                              <th className="p-2 text-left font-bold uppercase tracking-wider w-1/2">Service Provider Signature</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-[#cbd5e1]">
                              <td className="border-r border-[#cbd5e1] p-2 bg-white text-slate-800">
                                <div className="flex justify-between items-center">
                                  <span>Name: {agreement.clientSignedName || agreement.client.name}</span>
                                  {agreement.clientSignature && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteSignature('CLIENT')}
                                      className="h-5 w-5 text-red-500 hover:text-red-700 pointer-events-auto"
                                      title="Reset client signature"
                                    >
                                      <Trash className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                              <td className="p-2 bg-white text-slate-800">
                                <div className="flex justify-between items-center">
                                  <span>Name: {agreement.providerSignedName || agreement.companyName || 'Quantum Reach Media'}</span>
                                  {agreement.providerSignature && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteSignature('PROVIDER')}
                                      className="h-5 w-5 text-red-500 hover:text-red-700 pointer-events-auto"
                                      title="Reset provider signature"
                                    >
                                      <Trash className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                            <tr className="border-b border-[#cbd5e1] h-[60px]">
                              <td 
                                className="border-r border-[#cbd5e1] p-2 text-center vertical-align-middle bg-white cursor-pointer hover:bg-purple-100/10 transition-all"
                                onClick={() => !agreement.clientSignature && handleSignClick('CLIENT')}
                              >
                                {agreement.clientSignature ? (
                                  <img
                                    src={agreement.clientSignature}
                                    alt="Client Signature"
                                    className="max-h-[45px] mx-auto object-contain"
                                  />
                                ) : (
                                  <span className="text-purple-400 italic text-[9px]">
                                    Awaiting Signature
                                  </span>
                                )}
                              </td>
                              <td 
                                className="p-2 text-center vertical-align-middle bg-white cursor-pointer hover:bg-purple-100/10 transition-all"
                                onClick={() => !agreement.providerSignature && handleSignClick('PROVIDER')}
                              >
                                {agreement.providerSignature ? (
                                  <img
                                    src={agreement.providerSignature}
                                    alt="Provider Signature"
                                    className="max-h-[45px] mx-auto object-contain"
                                  />
                                ) : (
                                  <span className="text-purple-400 italic text-[9px] animate-pulse">
                                    Click here to sign
                                  </span>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td className="border-r border-[#cbd5e1] p-2 font-semibold bg-white text-slate-800">
                                Date: {agreement.clientSignedAt ? new Date(agreement.clientSignedAt).toLocaleDateString() : '__________'}
                              </td>
                              <td className="p-2 font-semibold bg-white text-slate-800">
                                Date: {agreement.providerSignedAt ? new Date(agreement.providerSignedAt).toLocaleDateString() : '__________'}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Brand Footer */}
                    <div className="absolute bottom-0 left-0 right-0 h-[60px] flex items-center justify-between px-10 border-t border-[#cbd5e1] bg-white z-20 overflow-hidden">
                      <svg className="absolute left-10 bottom-0 h-4 w-40 overflow-visible" viewBox="0 0 160 16">
                        <polygon points="20 16, 40 0, 80 0, 60 16" fill="#7c3aed" opacity="0.8" />
                        <polygon points="70 16, 90 0, 130 0, 110 16" fill="#581c87" />
                      </svg>
                      <span className="text-[9px] text-[#94a3b8] font-semibold tracking-wider">
                        Quantum Reach Media • Confidential Service Agreement
                      </span>
                      <span className="text-[10px] font-bold text-[#581c87]">
                        Page {pageNumber} of {totalPages}
                      </span>
                    </div>
                  </div>
                  </div>
                );
              })}
              </div>
            </div>

            {/* Right 1 Column: Metadata & Page Manager Panels */}
            <div className="space-y-4">
              
              {/* Execution Workflow Accordion */}
              <div className="border border-border bg-card/25 rounded-xl overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/10 transition-all select-none"
                  onClick={() => toggleSection('execution')}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-sm text-foreground font-bold">Execution Workflow</span>
                    <span className="text-[10px] text-muted-foreground">Copy link to share contract with the client</span>
                  </div>
                  {openSections.execution ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                {openSections.execution && (
                  <div className="p-4 pt-0 space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Client Signing Link</label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={signingLink}
                          className="h-8 text-xs font-mono select-all text-foreground bg-muted/20"
                        />
                        <Button variant="outline" size="icon" onClick={handleCopyLink} className="h-8 w-8 text-foreground">
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4 space-y-3">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          Client Signature:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded ${
                              agreement.clientSignature
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {agreement.clientSignature ? 'Signed' : 'Awaiting'}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSyncStatus}
                            disabled={loading}
                            className="h-6 w-6 text-muted-foreground hover:text-purple-700"
                            title="Sync signature status from client"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-muted-foreground font-medium">Provider Signature:</span>
                        <span
                          className={`font-semibold px-2 py-0.5 rounded ${
                            agreement.providerSignature
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {agreement.providerSignature ? 'Signed' : 'Awaiting'}
                        </span>
                      </div>

                      {!agreement.providerSignature && (
                        <Button
                          onClick={() => handleSignClick('PROVIDER')}
                          className="w-full mt-2 gap-1.5 text-xs bg-purple-700 hover:bg-purple-800 text-white shadow"
                        >
                          <FileSignature className="h-4 w-4" /> Sign as Service Provider
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Page Manager Accordion */}
              <div className="border border-border bg-card/25 rounded-xl overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/10 transition-all select-none"
                  onClick={() => toggleSection('pageManager')}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-sm text-foreground font-bold">Page Manager</span>
                    <span className="text-[10px] text-muted-foreground">Reorder or add contract pages</span>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setPages([...pages, '<h1>NEW EXTRA TERMS</h1><p>Type extra terms and conditions here...</p>']);
                        setIsClean(false);
                        toastSuccess('Page Added', 'A new extra page was successfully added.');
                      }}
                      className="gap-1 px-2.5 py-1 text-[10px] h-7 text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Page
                    </Button>
                    {openSections.pageManager ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground cursor-pointer" onClick={() => toggleSection('pageManager')} />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground cursor-pointer" onClick={() => toggleSection('pageManager')} />
                    )}
                  </div>
                </div>
                {openSections.pageManager && (
                  <div className="p-4 pt-0">
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {pages.map((_, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-muted/20 border border-border p-2 rounded-lg text-xs">
                          <div className="font-semibold text-foreground">
                            Page {idx + 1} {idx === 0 ? '(Intro)' : idx === pages.length - 1 ? '(Acceptance)' : '(Extra)'}
                          </div>
                          <div className="flex items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-foreground"
                              disabled={idx === 0}
                              onClick={() => {
                                const updated = [...pages];
                                const temp = updated[idx] as string;
                                updated[idx] = updated[idx - 1] as string;
                                updated[idx - 1] = temp;
                                setPages(updated);
                                setIsClean(false);
                              }}
                              title="Move Up"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-foreground"
                              disabled={idx === pages.length - 1}
                              onClick={() => {
                                const updated = [...pages];
                                const temp = updated[idx] as string;
                                updated[idx] = updated[idx + 1] as string;
                                updated[idx + 1] = temp;
                                setPages(updated);
                                setIsClean(false);
                              }}
                              title="Move Down"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:text-red-700"
                              disabled={pages.length <= 1}
                              onClick={() => {
                                const updated = pages.filter((_, i) => i !== idx);
                                setPages(updated);
                                setIsClean(false);
                                toastSuccess('Page Removed', `Page ${idx + 1} deleted.`);
                              }}
                              title="Delete Page"
                            >
                              <Trash className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Summary & Settings Accordion */}
              <div className="border border-border bg-card/25 rounded-xl overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/10 transition-all select-none"
                  onClick={() => toggleSection('financial')}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-sm text-foreground font-bold">Financial Summary & Settings</span>
                    <span className="text-[10px] text-muted-foreground">Retainer pricing and scheduling settings</span>
                  </div>
                  {openSections.financial ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                {openSections.financial && (
                  <div className="p-4 pt-0 space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Contract Title *</label>
                      <Input
                        required
                        value={editMetadata.title}
                        onChange={(e) => {
                          setEditMetadata({ ...editMetadata, title: e.target.value });
                          setIsClean(false);
                        }}
                        className="h-8 text-xs text-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Monthly Fee (INR)</label>
                        <Input
                          required
                          type="number"
                          value={editMetadata.monthlyFee}
                          onChange={(e) => {
                            setEditMetadata({ ...editMetadata, monthlyFee: Number(e.target.value) });
                            setIsClean(false);
                          }}
                          className="h-8 text-xs font-mono text-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Start Date *</label>
                        <Input
                          required
                          type="date"
                          value={editMetadata.startDate}
                          onChange={(e) => {
                            setEditMetadata({ ...editMetadata, startDate: e.target.value });
                            setIsClean(false);
                          }}
                          className="h-8 text-xs text-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">End Date (Optional)</label>
                      <Input
                        type="date"
                        value={editMetadata.endDate}
                        onChange={(e) => {
                          setEditMetadata({ ...editMetadata, endDate: e.target.value });
                          setIsClean(false);
                        }}
                        className="h-8 text-xs text-foreground"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Company Branding Info Accordion */}
              <div className="border border-border bg-card/25 rounded-xl overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/10 transition-all select-none"
                  onClick={() => toggleSection('branding')}
                >
                  <div className="flex flex-col text-left">
                    <span className="text-sm text-foreground font-bold">Company Branding Info</span>
                    <span className="text-[10px] text-muted-foreground">Branding assets and coordinates</span>
                  </div>
                  {openSections.branding ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                {openSections.branding && (
                  <div className="p-4 pt-0 space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Company Name</label>
                      <Input
                        value={editMetadata.companyName}
                        onChange={(e) => {
                          setEditMetadata({ ...editMetadata, companyName: e.target.value });
                          setIsClean(false);
                        }}
                        className="h-8 text-xs text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Company Website</label>
                      <Input
                        value={editMetadata.companyWebsite}
                        onChange={(e) => {
                          setEditMetadata({ ...editMetadata, companyWebsite: e.target.value });
                          setIsClean(false);
                        }}
                        className="h-8 text-xs text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Contact Email</label>
                      <Input
                        type="email"
                        value={editMetadata.companyEmail}
                        onChange={(e) => {
                          setEditMetadata({ ...editMetadata, companyEmail: e.target.value });
                          setIsClean(false);
                        }}
                        className="h-8 text-xs text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-muted-foreground">Contact Phone</label>
                      <Input
                        value={editMetadata.companyPhone}
                        onChange={(e) => {
                          setEditMetadata({ ...editMetadata, companyPhone: e.target.value });
                          setIsClean(false);
                        }}
                        className="h-8 text-xs text-foreground"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        </>
      ) : (
        /* Focused Export Audit History Tab */
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base text-foreground font-bold flex items-center gap-2">
              <History className="h-5 w-5 text-purple-700" />
              Contract Export Logs
            </CardTitle>
            <CardDescription className="text-xs">
              Chronological log of times when this service agreement was initialized or downloaded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Last Downloaded Time Stat */}
            <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 text-xs w-full">
              <span className="text-muted-foreground block mb-1 font-semibold">Last Downloaded At</span>
              <span className="font-bold text-foreground">{lastDownloadTime}</span>
            </div>

            {/* List logs focused ONLY on exports */}
            <div className="relative border-l border-purple-200/50 dark:border-purple-900/30 ml-4 pl-6 space-y-6">
              {exportLogs.map((log) => {
                const meta = log.newData && typeof log.newData === 'object' ? log.newData : {};

                return (
                  <div key={log.id} className="relative">
                    {/* Circle timeline bullet */}
                    <div className="absolute left-[-31px] top-1 h-3.5 w-3.5 rounded-full border-2 bg-background flex items-center justify-center border-indigo-500" />
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">
                          PDF Document Downloaded
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-mono bg-muted text-muted-foreground">
                          EXPORT
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        File <span className="font-mono text-purple-600 dark:text-purple-400">{meta.filename || 'agreement.pdf'}</span> downloaded by {meta.downloader === 'PROVIDER' ? 'Service Provider (Dashboard)' : 'Client (Public Signing Link)'}.
                      </p>
                      
                      <div className="text-[9px] text-slate-400 font-medium">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}

              {exportLogs.length === 0 && (
                <div className="text-center py-6 text-xs text-muted-foreground font-medium">
                  No download history recorded.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signature Modal */}
      <Dialog open={isSignOpen} onOpenChange={setIsSignOpen}>
        <DialogContent className="sm:max-w-md max-w-full">
          <DialogHeader>
            <DialogTitle className="text-base text-foreground font-bold">Adopt Legal Signature</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Verify credentials and sign this document legally.
            </DialogDescription>
          </DialogHeader>

          {signingRole && (
            <div className="py-2">
              <SignatureCanvas
                onSave={handleSaveSignature}
                defaultName={signingRole === 'CLIENT' ? agreement.client.name : 'Tushar (Quantum Reach Media)'}
                roleName={signingRole === 'CLIENT' ? 'Client' : 'Service Provider'}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full-Screen PDF-Viewer style Preview Overlay */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-[#09090b]/98 z-[9999] overflow-y-auto flex flex-col items-center">
          {/* Top Sticky Toolbar */}
          <div className="sticky top-0 w-full bg-[#18181b] border-b border-[#27272a] px-6 py-3 flex items-center justify-between text-white z-50">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-400" />
              <span className="font-bold text-sm font-sans truncate max-w-md">
                Preview: {editMetadata.title}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/api/agreements/${agreement.id}/pdf`} target="_blank">
                <Button size="sm" className="gap-1.5 text-xs bg-purple-700 hover:bg-purple-800 text-white font-semibold shadow">
                  <Download className="h-4 w-4" /> Download PDF
                </Button>
              </Link>
              <Button 
                onClick={() => setIsPreviewOpen(false)}
                variant="outline" 
                size="sm" 
                className="text-xs text-foreground font-semibold"
              >
                Close Preview
              </Button>
            </div>
          </div>

          {/* Centered Document Pages Wrapper */}
          <div className="py-10 px-4 w-full flex justify-center max-w-4xl animate-in fade-in zoom-in-95 duration-200">
            <AgreementPreview
              agreement={agreement}
              htmlContent={pages.join('<hr />')}
              onSignClick={handleSignClick}
              onDeleteSignature={async (role) => {
                setLoading(true);
                try {
                  const res = await deleteAgreementSignatureAction(agreement.id, role);
                  if (res.success && res.data) {
                    setAgreement({
                      ...agreement,
                      ...res.data,
                    });
                    toastSuccess('Signature Reset', `${role === 'CLIENT' ? 'Client' : 'Provider'} signature deleted successfully.`);
                  } else {
                    toastError('Delete Failed', !res.success ? res.error.message : 'Failed to reset signature.');
                  }
                } catch (err: any) {
                  toastError('Error', err.message || 'An unexpected error occurred.');
                } finally {
                  setLoading(false);
                }
              }}
              showSignatureActions={true}
            />
          </div>
        </div>
      )}

      <style jsx global>{`
        .editor-container .ProseMirror {
          outline: none;
          font-size: 10.66px !important;
          line-height: 1.25 !important;
          color: #334155 !important;
          font-family: Arial, Helvetica, sans-serif !important;
          min-height: 450px;
          background-color: #ffffff !important;
        }
        .editor-container .ProseMirror h1 {
          font-size: 14.66px !important;
          font-weight: bold;
          margin-top: 8px !important;
          margin-bottom: 4px !important;
          color: #581c87 !important;
          text-transform: uppercase;
        }
        .editor-container .ProseMirror h2 {
          font-size: 12.66px !important;
          font-weight: bold;
          margin-top: 6px !important;
          margin-bottom: 3px !important;
          color: #581c87 !important;
        }
        .editor-container .ProseMirror h3 {
          font-size: 12.00px !important;
          font-weight: bold;
          margin-top: 5px !important;
          margin-bottom: 2px !important;
          color: #7e22ce !important;
        }
        .editor-container .ProseMirror p {
          margin-bottom: 4px !important;
          color: #334155 !important;
        }
        .editor-container .ProseMirror ul {
          list-style-type: disc !important;
          padding-left: 16px !important;
          margin-bottom: 4px !important;
        }
        .editor-container .ProseMirror ol {
          list-style-type: decimal !important;
          padding-left: 16px !important;
          margin-bottom: 4px !important;
        }
        .editor-container .ProseMirror li {
          margin-bottom: 2px !important;
          color: #334155 !important;
        }
        .editor-container .ProseMirror table {
          width: 100%;
          border-collapse: collapse !important;
          border: 1px solid #cbd5e1 !important;
          margin-bottom: 10px !important;
          table-layout: fixed !important;
        }
        .editor-container .ProseMirror td:first-child:nth-last-child(2),
        .editor-container .ProseMirror td:first-child:nth-last-child(2) ~ td,
        .editor-container .ProseMirror th:first-child:nth-last-child(2),
        .editor-container .ProseMirror th:first-child:nth-last-child(2) ~ th {
          width: 50% !important;
        }
        .editor-container .ProseMirror td {
          padding: 6px !important;
          border: 1px solid #cbd5e1 !important;
          vertical-align: top;
          color: #334155 !important;
        }
        .editor-container .ProseMirror th {
          padding: 6px !important;
          border: 1px solid #cbd5e1 !important;
          border-bottom: 1px solid #cbd5e1 !important;
          background-color: #faf5ff;
          font-weight: bold;
          text-align: left;
          color: #581c87 !important;
        }
      `}</style>
    </div>
  );
}
