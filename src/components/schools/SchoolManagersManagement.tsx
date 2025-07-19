
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useSchoolManagers, useResetUserPassword, useDeactivateSchoolUser } from '@/hooks/useSchoolManagement';
import { Users, Key, Trash2, Loader2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type School = Tables<'schools'>;

interface SchoolManagersManagementProps {
  school: School;
}

export default function SchoolManagersManagement({ school }: SchoolManagersManagementProps) {
  const { data: managers, isLoading } = useSchoolManagers(school.id);
  const resetPasswordMutation = useResetUserPassword();
  const deactivateUserMutation = useDeactivateSchoolUser();

  const handleResetPassword = async (userId: string, email: string) => {
    try {
      await resetPasswordMutation.mutateAsync({ userId, email });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    try {
      await deactivateUserMutation.mutateAsync({ userId, schoolId: school.id });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRoleName = (role: string) => {
    return role === 'super_admin' ? 'Super Admin' : 'Admin';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          School Managers
        </CardTitle>
        <CardDescription>
          Manage admin and super admin users for {school.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : managers && managers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell className="font-medium">
                    {manager.profiles?.first_name || 'N/A'} {manager.profiles?.last_name || ''}
                  </TableCell>
                  <TableCell>{manager.profiles?.email || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(manager.role)}>
                      {formatRoleName(manager.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {manager.joined_at 
                      ? new Date(manager.joined_at).toLocaleDateString()
                      : new Date(manager.created_at).toLocaleDateString()
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset Password</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will reset the user's password to "Madariss123". The user will need to use this password to log in.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleResetPassword(manager.user_id, manager.profiles?.email || '')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Reset Password
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deactivate Manager</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will deactivate the manager's access to this school. This action can be reversed later.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeactivateUser(manager.user_id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Deactivate
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No managers found</h3>
            <p className="text-gray-600">
              No active managers found for this school.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
