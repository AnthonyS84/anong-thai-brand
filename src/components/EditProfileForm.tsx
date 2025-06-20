import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/hooks/useAuth';
import { supabaseService } from '@/services/supabaseService';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface EditProfileFormProps {
  onCancel: () => void;
  onSave: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ onCancel, onSave }) => {
  const { userProfile, updateProfile, isLoading, user } = useAuth();
  const [firstName, setFirstName] = useState(userProfile?.firstName || '');
  const [lastName, setLastName] = useState(userProfile?.lastName || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Update form when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  // Validation function
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validate form
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please correct the errors below',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('🔄 EditProfileForm: Starting profile update...');
    console.log('📝 EditProfileForm: Form data:', { firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() });
    console.log('👤 EditProfileForm: Current user:', user?.id);
    console.log('📋 EditProfileForm: Current profile:', userProfile);
    
    setIsSubmitting(true);
    
    try {
      const updates = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
      };
      
      console.log('📝 Updating auth profile with data:', updates);
      
      // Update the auth profile first
      await updateProfile(updates);
      console.log('✅ EditProfileForm: Auth profile updated successfully');
      
      // Verify the update by checking if customer record exists and sync it
      if (user) {
        console.log('🔍 EditProfileForm: Syncing with customer record...');
        try {
          const customer = await supabaseService.getCurrentUserCustomer();
          if (customer) {
            console.log('👤 Updating customer record:', customer.id);
            await supabaseService.updateCustomer(customer.id, {
              first_name: updates.firstName,
              last_name: updates.lastName,
              fullname: `${updates.firstName} ${updates.lastName}`,
              phone: updates.phone || customer.phone,
            });
            console.log('✅ Customer record synced successfully');
            
            // Show detailed success message
            toast({
              title: 'Profile Updated Successfully!',
              description: 'Your changes have been saved to all databases.',
              action: (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ),
            });
          } else {
            console.log('ℹ️ EditProfileForm: No customer record found, profile update only');
            toast({
              title: 'Profile Updated!',
              description: 'Your profile has been saved successfully.',
              action: (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ),
            });
          }
        } catch (customerError) {
          console.warn('⚠️ EditProfileForm: Customer sync warning:', customerError);
          // Still show success for profile update
          toast({
            title: 'Profile Updated!',
            description: 'Profile saved successfully. Customer sync pending.',
            action: (
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            ),
          });
        }
      }
      
      console.log('✅ EditProfileForm: Profile update completed successfully');
      
      // Small delay to ensure user sees the success message
      setTimeout(() => {
        onSave();
      }, 1500);
      
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      let errorMessage = 'Failed to update profile';
      if (error.message?.includes('duplicate')) {
        errorMessage = 'Email or phone number already exists';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error - please check your connection';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive',
        action: (
          <AlertCircle className="h-4 w-4 text-red-600" />
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    console.log('⏳ EditProfileForm: Profile data loading...');
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-anong-gold"></div>
        <span className="ml-3 text-anong-charcoal">Loading profile...</span>
      </div>
    );
  }

  console.log('🎯 EditProfileForm: Rendering form with:', { 
    firstName, 
    lastName, 
    phone, 
    isSubmitting,
    userProfile 
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="firstName" className="block text-sm font-medium text-anong-charcoal mb-2 font-serif">
            First Name *
          </Label>
          <Input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => {
              console.log('📝 EditProfileForm: First name changed to:', e.target.value);
              setFirstName(e.target.value);
              if (validationErrors.firstName) {
                setValidationErrors(prev => ({...prev, firstName: ''}));
              }
            }}
            className={`border-anong-sage/20 bg-anong-warm-cream/50 font-serif ${
              validationErrors.firstName ? 'border-red-300 bg-red-50' : ''
            }`}
            placeholder="Enter your first name"
            disabled={isSubmitting}
            required
          />
          {validationErrors.firstName && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.firstName}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="lastName" className="block text-sm font-medium text-anong-charcoal mb-2 font-serif">
            Last Name *
          </Label>
          <Input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => {
              console.log('📝 EditProfileForm: Last name changed to:', e.target.value);
              setLastName(e.target.value);
              if (validationErrors.lastName) {
                setValidationErrors(prev => ({...prev, lastName: ''}));
              }
            }}
            className={`border-anong-sage/20 bg-anong-warm-cream/50 font-serif ${
              validationErrors.lastName ? 'border-red-300 bg-red-50' : ''
            }`}
            placeholder="Enter your last name"
            disabled={isSubmitting}
            required
          />
          {validationErrors.lastName && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.lastName}</p>
          )}
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="phone" className="block text-sm font-medium text-anong-charcoal mb-2 font-serif">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              console.log('📝 EditProfileForm: Phone changed to:', e.target.value);
              setPhone(e.target.value);
              if (validationErrors.phone) {
                setValidationErrors(prev => ({...prev, phone: ''}));
              }
            }}
            className={`border-anong-sage/20 bg-anong-warm-cream/50 font-serif ${
              validationErrors.phone ? 'border-red-300 bg-red-50' : ''
            }`}
            placeholder="Enter your phone number (optional)"
            disabled={isSubmitting}
          />
          {validationErrors.phone && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
          )}
        </div>
      </div>
      
      {/* Required fields notice */}
      <div className="text-sm text-anong-charcoal/60 font-serif">
        * Required fields
      </div>
      
      <div className="flex space-x-4 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="gold"
          className="font-serif min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            console.log('❌ EditProfileForm: Cancel button clicked');
            onCancel();
          }}
          disabled={isSubmitting}
          className="border-anong-sage/20 text-anong-charcoal hover:bg-anong-sage/10 font-serif"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EditProfileForm;
