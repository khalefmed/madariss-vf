
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Copy, Download, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { downloadPasswordFile } from '@/utils/passwordGenerator';
import { useToast } from '@/hooks/use-toast';

interface PasswordDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  password: string;
  userName: string;
}

export default function PasswordDisplayModal({
  isOpen,
  onClose,
  email,
  password,
  userName
}: PasswordDisplayModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Password copied",
        description: "Password has been copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy password to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    downloadPasswordFile(email, password);
    toast({
      title: "File downloaded",
      description: "Login credentials have been saved to your downloads"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            User Created Successfully
          </DialogTitle>
          <DialogDescription>
            A new account has been created for {userName}. Please save these login credentials securely.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                value={email}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigator.clipboard.writeText(email)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Generated Password</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                readOnly
                className="flex-1 font-mono"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyPassword}
                className={copied ? "text-green-600" : ""}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Please save these credentials securely. 
              The user should change their password after first login.
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download Credentials
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
