'use client';

import React, { useState } from 'react';
import { generateAiReviewReply, publishReviewReply } from '../actions';
import { TonePresetSelector, TonePreset } from './tone-preset-selector';
import { Button } from '@/components/ui/button';
import { Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { GbpReview } from '@prisma/client';

interface ReviewReplyComposerProps {
  review: GbpReview;
  onPublished?: () => void;
}

export function ReviewReplyComposer({ review, onPublished }: ReviewReplyComposerProps) {
  const [tone, setTone] = useState<TonePreset>('PROFESSIONAL');
  const [replyText, setReplyText] = useState(review.replyText || '');
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateAiReviewReply({
        reviewId: review.id,
        tone,
      });

      if (res.success) {
        setReplyText(res.data);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!replyText.trim()) return;
    setPublishing(true);
    try {
      const res = await publishReviewReply({
        reviewId: review.id,
        replyText: replyText.trim(),
      });

      if (res.success && onPublished) {
        onPublished();
      }
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-3 p-3 rounded-xl border border-border bg-card/40">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          AI Reply Generator & Composer
        </label>
        <TonePresetSelector selectedTone={tone} onSelectTone={setTone} />
      </div>

      <textarea
        rows={3}
        placeholder="Type or click 'Generate AI Reply'..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        className="w-full rounded-md border border-input bg-background p-2.5 text-xs"
      />

      <div className="flex items-center justify-between pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={generating}
          onClick={handleGenerate}
          className="gap-1.5 text-xs text-primary border-primary/30 bg-primary/10"
        >
          <Sparkles className="h-3.5 w-3.5" /> {generating ? 'Drafting...' : 'Generate AI Reply'}
        </Button>

        <Button
          type="button"
          size="sm"
          disabled={publishing || !replyText.trim()}
          onClick={handlePublish}
          className="gap-1.5 text-xs shadow"
        >
          <Send className="h-3.5 w-3.5" /> {publishing ? 'Publishing...' : 'Publish to GBP'}
        </Button>
      </div>
    </div>
  );
}
