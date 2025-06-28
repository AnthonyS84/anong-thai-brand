import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabaseService } from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, CheckCircle, AlertCircle, Database } from 'lucide-react';

const DatabaseSync = () => {
  const { user, userProfile } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [syncData, setSyncData] = useState<any>(null);

  const checkDatabaseSync = async () => {
    if (!user) {
      toast({
        title: 'Not Logged In',
        description: 'Please log in to check database sync',
        variant: 'destructive'
      });
      return;
    }

    setIsChecking(true);
    setSyncData(null);

    try {
      console.log('🔍 DatabaseSync: Checking sync for user:', user.id);

      // Get profile data
      const profileData = userProfile;
      console.log('👤 DatabaseSync: Profile data:', profileData);

      // Get customer data
      let customerData = null;
      try {
        customerData = await supabaseService.getCurrentUserCustomer();
        console.log('👥 DatabaseSync: Customer data:', customerData);
      } catch (error) {
        console.log('ℹ️ DatabaseSync: No customer record found:', error);
      }

      // Get auth user data directly from Supabase
      let authUserData = null;
      try {
        const { data: authData } = await supabaseService.supabase.auth.getUser();
        authUserData = authData.user;
        console.log('🔐 DatabaseSync: Auth user data:', authUserData);
      } catch (error) {
        console.error('❌ DatabaseSync: Error getting auth data:', error);
      }

      // Analyze sync status
      const syncAnalysis = {
        profileExists: !!profileData,
        customerExists: !!customerData,
        authUserExists: !!authUserData,
        profileName: profileData ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() : null,
        customerName: customerData ? customerData.fullname : null,
        profilePhone: profileData?.phone,
        customerPhone: customerData?.phone,
        email: authUserData?.email || user.email,
        isNameSynced: false,
        isPhoneSynced: false,
        lastUpdated: {
          profile: profileData ? new Date().toISOString() : null,
          customer: customerData?.updated_at,
        }
      };

      // Check if names are synced
      if (syncAnalysis.profileName && syncAnalysis.customerName) {
        syncAnalysis.isNameSynced = syncAnalysis.profileName === syncAnalysis.customerName;
      }

      // Check if phones are synced
      if (syncAnalysis.profilePhone || syncAnalysis.customerPhone) {
        syncAnalysis.isPhoneSynced = syncAnalysis.profilePhone === syncAnalysis.customerPhone;
      }

      setSyncData({
        profile: profileData,
        customer: customerData,
        authUser: authUserData,
        analysis: syncAnalysis
      });

      // Show summary toast
      const issues = [];
      if (!syncAnalysis.profileExists) issues.push('Profile missing');
      if (!syncAnalysis.customerExists) issues.push('Customer record missing');
      if (syncAnalysis.profileName && syncAnalysis.customerName && !syncAnalysis.isNameSynced) {
        issues.push('Names not synced');
      }
      if ((syncAnalysis.profilePhone || syncAnalysis.customerPhone) && !syncAnalysis.isPhoneSynced) {
        issues.push('Phone numbers not synced');
      }

      if (issues.length === 0) {
        toast({
          title: 'Database Sync ✅',
          description: 'All user data is properly synchronized',
        });
      } else {
        toast({
          title: 'Sync Issues Found',
          description: `Found ${issues.length} issue(s): ${issues.join(', ')}`,
          variant: 'destructive'
        });
      }

    } catch (error: any) {
      console.error('❌ DatabaseSync: Error checking sync:', error);
      toast({
        title: 'Sync Check Failed',
        description: error.message || 'Failed to check database sync',
        variant: 'destructive'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const fixSync = async () => {
    if (!user || !syncData) return;

    setIsChecking(true);

    try {
      console.log('🔧 DatabaseSync: Attempting to fix sync issues...');

      const { profile, customer, analysis } = syncData;

      // If customer exists but names don't match, sync from profile to customer
      if (profile && customer && analysis.profileName && !analysis.isNameSynced) {
        console.log('🔄 DatabaseSync: Syncing name from profile to customer');
        await supabaseService.updateCustomer(customer.id, {
          first_name: profile.firstName,
          last_name: profile.lastName,
          fullname: analysis.profileName,
        });
      }

      // If customer exists but phones don't match, sync from profile to customer
      if (profile && customer && !analysis.isPhoneSynced) {
        console.log('🔄 DatabaseSync: Syncing phone from profile to customer');
        await supabaseService.updateCustomer(customer.id, {
          phone: profile.phone,
        });
      }

      // If no customer record exists but profile does, create customer
      if (profile && !customer && analysis.profileName) {
        console.log('🆕 DatabaseSync: Creating customer record from profile');
        await supabaseService.createCustomer({
          user_id: user.id,
          email: analysis.email,
          first_name: profile.firstName || '',
          last_name: profile.lastName || '',
          fullname: analysis.profileName,
          phone: profile.phone || '',
          is_active: true,
          total_orders: 0,
          total_spent: 0,
        });
      }

      toast({
        title: 'Sync Fixed!',
        description: 'Database synchronization has been repaired',
      });

      // Re-check sync status
      setTimeout(() => {
        checkDatabaseSync();
      }, 1000);

    } catch (error: any) {
      console.error('❌ DatabaseSync: Error fixing sync:', error);
      toast({
        title: 'Fix Failed',
        description: error.message || 'Failed to fix database sync',
        variant: 'destructive'
      });
    } finally {
      setIsChecking(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Please log in to check database sync</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Sync Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={checkDatabaseSync}
            disabled={isChecking}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Sync'}
          </Button>
          
          {syncData && (
            <Button
              onClick={fixSync}
              disabled={isChecking}
              variant="outline"
              className="flex items-center gap-2"
            >
              Fix Issues
            </Button>
          )}
        </div>

        {syncData && (
          <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg">Sync Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {syncData.analysis.profileExists ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>Profile Table</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {syncData.analysis.customerExists ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span>Customer Table</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {syncData.analysis.isNameSynced ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span>Name Sync</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {syncData.analysis.isPhoneSynced ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span>Phone Sync</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Email:</strong> {syncData.analysis.email}
                </div>
                <div>
                  <strong>Profile Name:</strong> {syncData.analysis.profileName || 'Not set'}
                </div>
                <div>
                  <strong>Customer Name:</strong> {syncData.analysis.customerName || 'Not set'}
                </div>
                <div>
                  <strong>Profile Phone:</strong> {syncData.analysis.profilePhone || 'Not set'}
                </div>
                <div>
                  <strong>Customer Phone:</strong> {syncData.analysis.customerPhone || 'Not set'}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseSync;
