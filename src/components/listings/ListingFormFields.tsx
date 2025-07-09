import React, { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ListingFormData, popularBreeds } from './listingSchema';
import UnifiedMediaUpload from './UnifiedMediaUpload';
import { useBreedColors } from '@/hooks/useBreedColors';

interface ListingFormFieldsProps {
  form: UseFormReturn<ListingFormData>;
}

const ListingFormFields = ({ form }: ListingFormFieldsProps) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  
  // Watch the breed field to update color options
  const selectedBreed = form.watch('breed');
  const { colors: breedColors, loading: colorsLoading } = useBreedColors(selectedBreed);

  const handleNumberInput = (value: string, onChange: (value: number) => void) => {
    // Remove leading zeros and convert to number
    const cleanedValue = value.replace(/^0+/, '') || '0';
    const numericValue = parseInt(cleanedValue, 10);
    
    // Only update if it's a valid number
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  };

  const handleImagesChange = (urls: string[]) => {
    setImageUrls(urls);
    form.setValue('images', urls);
  };

  const handleVideoChange = (url: string) => {
    setVideoUrl(url);
    form.setValue('video_url', url);
  };

  // Reset color when breed changes
  useEffect(() => {
    if (selectedBreed && breedColors.length > 0) {
      const currentColor = form.getValues('color');
      if (currentColor && !breedColors.includes(currentColor)) {
        form.setValue('color', '');
      }
    }
  }, [selectedBreed, breedColors, form]);

  return (
    <>
      {/* Media Upload Section */}
      <div className="space-y-4 border-b pb-6">
        <h3 className="text-lg font-semibold">Media</h3>
        <UnifiedMediaUpload
          onImagesChange={handleImagesChange}
          onVideoChange={handleVideoChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="dog_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dog Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Buddy" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="breed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Breed</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a breed" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {popularBreeds.map((breed) => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age (weeks)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g., 8" 
                  value={field.value === 0 ? '' : field.value.toString()}
                  onChange={(e) => handleNumberInput(e.target.value, field.onChange)}
                  onKeyPress={(e) => {
                    // Prevent non-numeric characters
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                      e.preventDefault();
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price ($)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g., 1200" 
                  value={field.value === 0 ? '' : field.value.toString()}
                  onChange={(e) => handleNumberInput(e.target.value, field.onChange)}
                  onKeyPress={(e) => {
                    // Prevent non-numeric characters
                    if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                      e.preventDefault();
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Small">Small</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Large">Large</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                  disabled={colorsLoading || (!selectedBreed)}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        !selectedBreed 
                          ? "Select a breed first" 
                          : colorsLoading 
                            ? "Loading colors..." 
                            : breedColors.length > 0 
                              ? "Select color" 
                              : "No colors available"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {breedColors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                    {breedColors.length > 0 && (
                      <SelectItem value="Other">Other</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location</FormLabel>
            <FormControl>
              <Input placeholder="e.g., San Francisco, CA" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Tell us about your dog..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Health & Care Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold">Health & Care</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vaccinated"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Vaccinated</FormLabel>
                  <div className="text-sm text-gray-500">
                    Up to date on vaccinations
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="neutered_spayed"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Neutered/Spayed</FormLabel>
                  <div className="text-sm text-gray-500">
                    Already fixed
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Temperament Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold">Temperament & Compatibility</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="good_with_kids"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Good with Kids</FormLabel>
                  <div className="text-sm text-gray-500">
                    Child-friendly temperament
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="good_with_dogs"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Good with Dogs</FormLabel>
                  <div className="text-sm text-gray-500">
                    Gets along with other dogs
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Special Considerations Section */}
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold">Special Considerations</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="special_needs"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Special Needs</FormLabel>
                  <div className="text-sm text-gray-500">
                    Requires special care or attention
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rehoming"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Rehoming</FormLabel>
                  <div className="text-sm text-gray-500">
                    This is a rehoming situation
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="delivery_available"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Delivery Available</FormLabel>
                  <div className="text-sm text-gray-500">
                    This puppy can be delivered to its new home
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default ListingFormFields;
