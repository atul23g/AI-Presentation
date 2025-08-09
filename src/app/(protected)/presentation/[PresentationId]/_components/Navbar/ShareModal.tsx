'use client';
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Copy, 
  Mail, 
  MessageSquare, 
  Share2, 
  Eye, 
  EyeOff,
  ExternalLink,
  Check,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  presentationId: string;
  presentationTitle?: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  presentationId,
  presentationTitle = "Presentation"
}) => {
  const [isPublic, setIsPublic] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}/share/${presentationId}`;
  // Removed edit link per requirements

  const handleCopyLink = async (url: string, type: string) => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success('Link Copied!', {
        description: `${type} link has been copied to your clipboard`,
      });
      
      // Reset copy state after 2 seconds
      setTimeout(() => {
        setCopiedUrl(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy link', {
        description: 'Please try again or copy the link manually',
      });
    } finally {
      setIsCopying(false);
    }
  };

  const handleEmailShare = () => {
    const subject = `Check out this presentation: ${presentationTitle}`;
    const body = `I wanted to share this presentation with you:\n\n${presentationTitle}\n\nView it here: ${shareUrl}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(emailUrl, '_blank');
  };

  const handleSocialShare = (platform: 'whatsapp') => {
    const text = `Check out this presentation: ${presentationTitle}`;
    let shareUrlForPlatform = '';

    switch (platform) {
      case 'whatsapp':
        shareUrlForPlatform = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl}`)}`;
        break;
    }

    window.open(shareUrlForPlatform, '_blank', 'width=600,height=400');
  };

  const canNativeShare = typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function';

  const handleNativeShare = async () => {
    if (canNativeShare) {
      try {
        await (navigator as any).share({
          title: presentationTitle,
          text: `Check out this presentation: ${presentationTitle}`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        console.log('Native share cancelled or failed');
      }
    } else {
      // Fallback to copying link
      handleCopyLink(shareUrl, 'Share');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Presentation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Public Access Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Eye className="w-5 h-5 text-green-600" />
              ) : (
                <EyeOff className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <p className="font-medium">Public Access</p>
                <p className="text-sm text-muted-foreground">
                  {isPublic ? 'Anyone with the link can view' : 'Access restricted'}
                </p>
              </div>
            </div>
            <Button
              variant={isPublic ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPublic(!isPublic)}
            >
              {isPublic ? 'Public' : 'Private'}
            </Button>
          </div>

          {/* Share Link */}
          <div className="space-y-3">
            <Label htmlFor="share-link">Share Link</Label>
            <div className="flex gap-2">
              <Input
                id="share-link"
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => handleCopyLink(shareUrl, 'Share')}
                disabled={isCopying}
              >
                {isCopying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : copiedUrl === shareUrl ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Quick Share Options */}
          <div className="space-y-3">
            <Label>Quick Share</Label>
            <div className="grid grid-cols-2 gap-2">
              {/* Native Share (if supported) */}
              {canNativeShare && (
                <Button
                  variant="outline"
                  className="justify-start gap-2"
                  onClick={handleNativeShare}
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              )}
              
              {/* Email */}
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={handleEmailShare}
              >
                <Mail className="w-4 h-4" />
                Email
              </Button>
              
              {/* WhatsApp */}
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={() => handleSocialShare('whatsapp')}
              >
                <MessageSquare className="w-4 h-4" />
                WhatsApp
              </Button>
              
              {/* Open in new tab */}
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={() => window.open(shareUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                Preview
              </Button>
            </div>
          </div>

          {/* Social Media buttons removed per requirements */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;

