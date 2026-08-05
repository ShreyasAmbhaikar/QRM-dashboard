'use client';

import React, { useState } from 'react';
import { AgreementWithClient, signAgreementAction, deleteAgreementSignatureAction } from '@/features/agreements/actions';
import { AgreementPreview } from '@/features/agreements/components/agreement-preview';
import { SignatureCanvas } from '@/features/agreements/components/signature-canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Download, FileSignature, CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface PublicSignClientPageProps {
  initialAgreement: AgreementWithClient;
}

export function PublicSignClientPage({ initialAgreement }: PublicSignClientPageProps) {
  const [agreement, setAgreement] = useState<AgreementWithClient>(initialAgreement);
  const [signingRole, setSigningRole] = useState<'CLIENT' | 'PROVIDER' | null>(null);
  const [isSignOpen, setIsSignOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { success: toastSuccess, error: toastError } = useToast();

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
        // Refetch/update the state
        // We simulate refreshing by updating local state
        setAgreement({
          ...agreement,
          ...res.data,
        });
        toastSuccess('Signature Captured', `${signingRole === 'CLIENT' ? 'Client' : 'Provider'} signature saved successfully!`);
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

  const isSigned = agreement.status === 'SIGNED';
  const hasClientSigned = !!agreement.clientSignature;

  return (
    <div className="space-y-6">
      {/* Floating Action / Top Control Panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border border-[#e9d5ff] rounded-xl bg-purple-50/20 shadow-sm">
        <div className="flex items-center gap-2">
          {isSigned ? (
            <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="h-5 w-5" />
            </div>
          ) : (
            <div className="p-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse">
              <FileSignature className="h-5 w-5" />
            </div>
          )}
          <div>
            <h3 className="text-xs font-bold text-foreground">
              {isSigned ? 'Contract Fully Executed' : hasClientSigned ? 'Awaiting Provider Signature' : 'Contract Signature Required'}
            </h3>
            <p className="text-[10px] text-muted-foreground">
              {isSigned 
                ? 'All parties have signed. Download the official PDF below.' 
                : hasClientSigned 
                ? 'You have signed this agreement successfully. Awaiting Quantum Reach Media execution.'
                : 'Please review the scope, objectives, and terms below, then sign at the bottom.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!hasClientSigned && (
            <Button 
              onClick={() => handleSignClick('CLIENT')} 
              className="flex-1 sm:flex-initial gap-1.5 shadow-md bg-purple-700 hover:bg-purple-800 text-white text-xs"
            >
              <FileSignature className="h-4 w-4" /> Click to Sign
            </Button>
          )}

          <Link href={`/api/agreements/${agreement.id}/pdf`} target="_blank" className="flex-1 sm:flex-initial">
            <Button variant="outline" className="w-full gap-1.5 text-xs text-foreground">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </Link>
        </div>
      </div>

      {/* Render Document Sheets */}
      <div className="shadow-lg rounded-2xl overflow-hidden border border-border">
        <AgreementPreview
          agreement={agreement}
          htmlContent={agreement.content}
          onSignClick={handleSignClick}
          onDeleteSignature={handleDeleteSignature}
          showSignatureActions={!isSigned}
        />
      </div>

      {/* Signature Capture Modal Dialog */}
      <Dialog open={isSignOpen} onOpenChange={setIsSignOpen}>
        <DialogContent className="sm:max-w-md max-w-full">
          <DialogHeader>
            <DialogTitle className="text-base text-foreground font-bold">Adopt Legal Signature</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              By adopting this signature, you agree to bound yourself legally to the terms of this service agreement.
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
    </div>
  );
}
