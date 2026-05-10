import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { apiRequest } from '@/lib/api';
import { MapPin, ArrowLeft, AlertCircle, QrCode } from 'lucide-react';

export default function DogProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { data: dog, isLoading, error } = useQuery({
    queryKey: ['/api/dogs', id],
    queryFn: () => apiRequest(`/api/dogs/${id}`) as Promise<Record<string, unknown>>,
    enabled: !!id,
  });

  if (isLoading || !id) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <p className="text-gray-500">Loading dog profile…</p>
      </div>
    );
  }
  if (error || !dog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 gap-4">
        <p className="text-gray-600 dark:text-gray-400">Dog profile not found.</p>
        <Link to="/lost-and-found">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Lost & Found</Button>
        </Link>
      </div>
    );
  }

  const name = (dog.name as string) || 'Unknown';
  const breed = (dog.breed as string) || '—';
  const color = (dog.color as string) || '—';
  const photoUrl = (dog.photo_url as string) || null;
  const [qrLoading, setQrLoading] = useState(false);

  const handleDownloadQrTag = async () => {
    if (!id) return;
    setQrLoading(true);
    try {
      const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/dog/${id}` : '';
      const dataUrl = await QRCode.toDataURL(profileUrl, { width: 256, margin: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `mypup-dog-${name.replace(/\s+/g, '-')}-qr.png`;
      a.click();
    } finally {
      setQrLoading(false);
    }
  };

  const handlePrintQrTag = async () => {
    if (!id) return;
    setQrLoading(true);
    try {
      const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/dog/${id}` : '';
      const dataUrl = await QRCode.toDataURL(profileUrl, { width: 200, margin: 2 });
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`
          <!DOCTYPE html><html><head><title>PAWS Dog Tag - ${name}</title></head>
          <body style="font-family:sans-serif;padding:24px;text-align:center;max-width:320px;margin:0 auto">
            <h1 style="margin-bottom:8px">Scan if found</h1>
            <p style="color:#666;margin-bottom:16px">This dog is registered on PAWS</p>
            <img src="${dataUrl}" alt="QR code" width="200" height="200" style="display:block;margin:0 auto 12px" />
            <p style="font-weight:600">${name}</p>
            <p style="font-size:12px;color:#666">${breed}</p>
            <p style="margin-top:16px"><button onclick="window.print()" style="padding:8px 20px;font-size:14px;cursor:pointer">Print QR tag</button></p>
          </body></html>`);
        w.document.close();
      }
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-lg mx-auto p-4 pb-8">
        <Link to="/lost-and-found" className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:underline mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Lost & Found
        </Link>
        <Card className="overflow-hidden">
          {photoUrl && (
            <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700">
              <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
            </div>
          )}
          <CardHeader className="pb-2">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{name}</h1>
            <p className="text-gray-600 dark:text-gray-400">Breed: {breed} · Color: {color}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-200">Scan if found</p>
                <p className="text-sm text-amber-800 dark:text-amber-300">This dog is registered on PAWS. Contact the owner or report the location below.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="border-gray-300"
                disabled={qrLoading}
                onClick={handleDownloadQrTag}
              >
                <QrCode className="w-4 h-4 mr-2" />
                {qrLoading ? 'Preparing…' : 'Download QR tag'}
              </Button>
              <Button
                variant="outline"
                className="border-gray-300"
                disabled={qrLoading}
                onClick={handlePrintQrTag}
              >
                Print QR tag
              </Button>
              <Link to={`/lost-and-found?report=${id}`}>
                <Button className="w-full sm:w-auto">
                  <MapPin className="w-4 h-4 mr-2" />
                  Report found location
                </Button>
              </Link>
              <Link to="/lost-and-found">
                <Button variant="outline">View Lost & Found feed</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
