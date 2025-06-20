import React, { useState, ChangeEvent, FormEvent } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FormData {
  fullName: string;
  email: string;
}

interface CreateCustomerFormProps {}

const CreateCustomerForm: React.FC<CreateCustomerFormProps> = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
  });

  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    try {
      console.log('Creating customer record only (no auth user):', formData);

      // Check if customer already exists by email
      const { data: existingCustomer, error: checkError } = await supabase
        .from('customers')
        .select('id, email')
        .eq('email', formData.email)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing customer:', checkError);
        throw new Error('Failed to check existing customer: ' + checkError.message);
      }

      if (existingCustomer) {
        setError(`A customer with email ${formData.email} already exists.`);
        return;
      }

      // Create customer record directly (no auth user creation)
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          fullname: formData.fullName,
          email: formData.email,
          first_name: formData.fullName.split(' ')[0] || '',
          last_name: formData.fullName.split(' ').slice(1).join(' ') || '',
          // Note: user_id is left NULL for customers without auth accounts
          user_id: null
        })
        .select()
        .single();

      if (customerError) {
        console.error('Error creating customer:', customerError);
        throw new Error('Failed to create customer record: ' + customerError.message);
      }

      console.log('Customer record created successfully:', newCustomer);
      setMessage('Customer record created successfully! This customer exists only in the customer database and does not have login access.');
      setFormData({ fullName: '', email: '' });
      
      toast({
        title: "Success!",
        description: "Customer record created successfully.",
      });

    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(err.message || 'Failed to create customer');
      
      toast({
        title: "Error",
        description: err.message || 'Failed to create customer',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto' }}>
      <h2>Create Customer</h2>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        This creates a customer record only (no login access). For users who need login access, use the Admin User Creation tool.
      </p>
      <form onSubmit={handleSubmit}>
        <label>
          Full Name:<br />
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </label>
        <br /><br />
        <label>
          Email:<br />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </label>
        <br /><br />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Customer Record'}
        </button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default CreateCustomerForm;
