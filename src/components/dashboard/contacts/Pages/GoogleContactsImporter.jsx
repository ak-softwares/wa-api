// components/GoogleContactsImporter.jsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { useSearchParams } from 'next/navigation';


export default function GoogleContactsImporter() {
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const imported = searchParams.get('imported');
    const count = searchParams.get('count');
    if (imported === 'true') {
      toast.success(`${count} contacts imported successfully!`);
    }
  }, [searchParams]);

  const handleImportContacts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/google/get-contact-url');
      const data = await res.json();

      if (!data.success) {
        toast.error(data.message || 'Failed to get Google OAuth URL');
        setLoading(false);
        return;
      }

      // Redirect user to Google consent screen
      window.location.href = data.url;
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleImportContacts}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {loading ? 'Loading...' : 'Import Google Contacts'}
      </Button>
    </div>
  );
}
