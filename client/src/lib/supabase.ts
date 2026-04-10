import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gtjjklulfzkwqjvoqclg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0amprbHVsZnprd3Fqdm9xY2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMTI4MjcsImV4cCI6MjA4OTY4ODgyN30.S3zxW1VQwJNxebjYCV8FSZb97_goMypPyO_p06bIDrc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for Supabase tables
export interface SupabaseStudent {
  id: string;
  email: string;
  password: string;
  name: string;
  class: string;
  monthly_fee: number;
  created_at: string;
  updated_at: string;
}

export interface SupabasePayment {
  id: string;
  student_id: string;
  month: number;
  year: number;
  payment_date: string | null;
  amount: number;
  created_at: string;
  updated_at: string;
}

// Helper functions for Supabase queries
export async function getStudentsFromSupabase() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching students:', error);
    return [];
  }

  return data as SupabaseStudent[];
}

export async function getStudentByEmailFromSupabase(email: string) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error) {
    console.error('Error fetching student:', error);
    return null;
  }

  return data as SupabaseStudent | null;
}

export async function getStudentPaymentsFromSupabase(studentId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('student_id', studentId)
    .order('year', { ascending: false })
    .order('month', { ascending: false });

  if (error) {
    console.error('Error fetching payments:', error);
    return [];
  }

  return data as SupabasePayment[];
}

export async function getCurrentMonthPaymentFromSupabase(studentId: string) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('student_id', studentId)
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .single();

  if (error) {
    // No payment record found for this month
    return null;
  }

  return data as SupabasePayment | null;
}

export async function createPaymentInSupabase(payment: Omit<SupabasePayment, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select()
    .single();

  if (error) {
    console.error('Error creating payment:', error);
    return null;
  }

  return data as SupabasePayment;
}

export async function updatePaymentInSupabase(id: string, updates: Partial<SupabasePayment>) {
  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating payment:', error);
    return null;
  }

  return data as SupabasePayment;
}

export async function deletePaymentFromSupabase(id: string) {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting payment:', error);
    return false;
  }

  return true;
}
