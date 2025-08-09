'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, Trash2, AlertTriangle, FileText, Database } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { deleteUserAccount } from '@/actions/user';

interface DataManagementProps {
  userId: string;
}

const DataManagement: React.FC<DataManagementProps> = ({ userId }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock data export
      const exportData = {
        userId,
        exportDate: new Date().toISOString(),
        data: {
          profile: {
            name: 'User Name',
            email: 'user@example.com',
            createdAt: new Date().toISOString(),
          },
          projects: [
            {
              id: 'project-1',
              title: 'Sample Project',
              createdAt: new Date().toISOString(),
            }
          ],
          settings: {
            emailNotifications: true,
            pushNotifications: false,
            darkMode: true,
            autoSave: true,
          }
        }
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-presentation-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully', {
        description: 'Your data has been downloaded as a JSON file.',
      });
    } catch (error) {
      toast.error('Failed to export data', {
        description: 'Please try again later.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteUserAccount();
      
      if (result.status === 200) {
        toast.success('Account deleted successfully', {
          description: 'You will be redirected to the sign-in page.',
        });
        
        // Redirect to sign-in page after a short delay
        setTimeout(() => {
          window.location.href = '/sign-in';
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to delete account');
      }
    } catch (error) {
      toast.error('Failed to delete account', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export your data or manage your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Export Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <h4 className="font-medium text-primary">Export Your Data</h4>
                <p className="text-sm text-secondary">
                  Download all your projects, settings, and account information as a JSON file
                </p>
              </div>
              <Button 
                onClick={handleExportData} 
                disabled={isExporting}
                variant="outline"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
              <Upload className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <h4 className="font-medium text-primary">Import Data</h4>
                <p className="text-sm text-secondary">
                  Import your data from a previously exported file (Coming Soon)
                </p>
              </div>
              <Button variant="outline" disabled>
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center gap-3 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <h4 className="font-medium text-destructive">Delete Account</h4>
                <p className="text-sm text-secondary">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-600 mb-1">Important Notice</h4>
                <p className="text-sm text-yellow-600/80">
                  Account deletion is permanent and irreversible. All your projects, settings, and data will be permanently removed from our servers.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DataManagement;


