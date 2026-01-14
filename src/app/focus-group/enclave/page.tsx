import { redirect } from 'next/navigation';

// Redirect old enclave routes to new login page
export default function EnclaveRedirect() {
  redirect('/login');
}








