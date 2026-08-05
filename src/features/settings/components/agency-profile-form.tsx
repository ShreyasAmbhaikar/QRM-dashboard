'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { User, Mail, Building2, Palette, Save, CheckCircle2 } from 'lucide-react';
import { updateUserProfile } from '@/features/settings/actions';

interface AgencyProfileFormProps {
  initialUser: {
    name: string;
    email: string;
    image?: string;
  };
}

export function AgencyProfileForm({ initialUser }: AgencyProfileFormProps) {
  const { success, error: toastError } = useToast();
  const [name, setName] = useState(initialUser.name);
  const [email, setEmail] = useState(initialUser.email);
  const [image, setImage] = useState(initialUser.image || '');
  const [imagePreview, setImagePreview] = useState(initialUser.image || '');
  const [agencyName, setAgencyName] = useState('Quantum Reach Media');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toastError('File Too Large', 'Please upload an image smaller than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateUserProfile({ name, email, image });
      if (res.success) {
        success('Agency Profile Updated', 'Profile credentials saved successfully.');
      } else {
        toastError('Update Failed', res.error.message || 'Failed to update profile settings.');
      }
    } catch (err: any) {
      toastError('Error', err.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-border/80 shadow-sm text-xs">
      <CardHeader className="border-b border-border/50 pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <User className="h-4 w-4 text-primary" /> Agency Profile & Branding
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Preview Row */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl border border-border/60 bg-muted/20">
            <div
              className="relative group cursor-pointer h-12 w-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-base border border-white/20 overflow-hidden"
              style={{ backgroundColor: primaryColor }}
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Avatar Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                name ? name.substring(0, 2).toUpperCase() : 'QA'
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-bold text-white uppercase text-center leading-none">Upload</span>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">{name || 'Admin User'}</h4>
              <p className="text-xs text-muted-foreground">{email || 'admin@quantumreachmedia.com'}</p>
            </div>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Admin User Name</label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="pl-8 h-8 text-xs bg-muted/30 border-border/80 focus-visible:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Admin Email Address</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-8 h-8 text-xs bg-muted/30 border-border/80 focus-visible:ring-primary"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Agency Portal Name</label>
              <div className="relative">
                <Building2 className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="pl-8 h-8 text-xs bg-muted/30 border-border/80 focus-visible:ring-primary"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Primary Brand Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="p-1 h-8 w-12 cursor-pointer border-border/80 bg-muted/30"
                />
                <div className="relative flex-1">
                  <Palette className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="pl-8 h-8 text-xs font-mono bg-muted/30 border-border/80"
                  />
                </div>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={isSaving} className="h-9 text-xs font-semibold gap-2 px-4 shadow-sm">
            <Save className="h-3.5 w-3.5" />
            {isSaving ? 'Saving Changes...' : 'Save Profile Settings'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
