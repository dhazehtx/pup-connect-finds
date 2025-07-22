
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UserProfile, ProfileExportData } from '@/types/profile';
import { supabase } from '@/integrations/supabase/client';

export const useProfileExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportProfile = async (
    profile: UserProfile, 
    format: 'json' | 'pdf' | 'csv' = 'json'
  ) => {
    try {
      setIsExporting(true);

      // Fetch additional data for export
      const [listingsData, reviewsData, favoritesData] = await Promise.all([
        supabase.from('dog_listings').select('*').eq('user_id', profile.id),
        supabase.from('reviews').select('*').eq('reviewed_user_id', profile.id),
        supabase.from('favorites').select('*').eq('user_id', profile.id)
      ]);

      const exportData: ProfileExportData = {
        profile,
        listings: listingsData.data || [],
        reviews: reviewsData.data || [],
        favorites: favoritesData.data || [],
        export_date: new Date().toISOString(),
        export_format: format
      };

      if (format === 'json') {
        downloadJSON(exportData, `${profile.username || 'profile'}_export.json`);
      } else if (format === 'csv') {
        downloadCSV(exportData, `${profile.username || 'profile'}_export.csv`);
      } else if (format === 'pdf') {
        await generatePDF(exportData);
      }

      toast({
        title: "Export Complete",
        description: `Your profile has been exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting profile:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your profile",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadJSON = (data: ProfileExportData, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (data: ProfileExportData, filename: string) => {
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: ProfileExportData): string => {
    const profile = data.profile;
    const rows = [
      ['Field', 'Value'],
      ['Username', profile.username || ''],
      ['Full Name', profile.full_name || ''],
      ['Email', profile.email],
      ['User Type', profile.user_type],
      ['Verified', profile.verified.toString()],
      ['Rating', profile.rating.toString()],
      ['Total Reviews', profile.total_reviews.toString()],
      ['Years Experience', profile.years_experience.toString()],
      ['Location', profile.location || ''],
      ['Bio', profile.bio || ''],
      ['Phone', profile.phone || ''],
      ['Website', profile.website_url || ''],
      ['Total Listings', data.listings.length.toString()],
      ['Total Reviews Received', data.reviews.length.toString()],
      ['Total Favorites', data.favorites.length.toString()],
    ];

    return rows.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  };

  const generatePDF = async (data: ProfileExportData) => {
    // For PDF generation, we would typically use a library like jsPDF
    // For now, we'll create a simple HTML version and print it
    const htmlContent = generateHTMLReport(data);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateHTMLReport = (data: ProfileExportData): string => {
    const profile = data.profile;
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Profile Export - ${profile.full_name || profile.username}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Profile Export</h1>
            <p><span class="label">Export Date:</span> ${new Date(data.export_date).toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Basic Information</h2>
            <p><span class="label">Name:</span> ${profile.full_name || 'N/A'}</p>
            <p><span class="label">Username:</span> ${profile.username || 'N/A'}</p>
            <p><span class="label">Email:</span> ${profile.email}</p>
            <p><span class="label">User Type:</span> ${profile.user_type}</p>
            <p><span class="label">Verified:</span> ${profile.verified ? 'Yes' : 'No'}</p>
            <p><span class="label">Rating:</span> ${profile.rating}/5 (${profile.total_reviews} reviews)</p>
            <p><span class="label">Experience:</span> ${profile.years_experience} years</p>
            <p><span class="label">Location:</span> ${profile.location || 'N/A'}</p>
            <p><span class="label">Bio:</span> ${profile.bio || 'N/A'}</p>
          </div>

          <div class="section">
            <h2>Statistics</h2>
            <p><span class="label">Total Listings:</span> ${data.listings.length}</p>
            <p><span class="label">Reviews Received:</span> ${data.reviews.length}</p>
            <p><span class="label">Favorites:</span> ${data.favorites.length}</p>
          </div>
        </body>
      </html>
    `;
  };

  return {
    exportProfile,
    isExporting
  };
};
