
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

export const EducationFeaturedSection: React.FC = () => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const checklistItems = [
    { id: 1, emoji: '🏠', text: 'Puppy-proof your home and yard' },
    { id: 2, emoji: '🛏️', text: 'Set up a comfortable sleeping area' },
    { id: 3, emoji: '🥣', text: 'Food and water bowls (stainless steel or ceramic)' },
    { id: 4, emoji: '🦴', text: 'High-quality puppy food' },
    { id: 5, emoji: '🎾', text: 'Age-appropriate toys for teething and play' },
    { id: 6, emoji: '🦮', text: 'Collar with ID tag and leash' },
    { id: 7, emoji: '🏥', text: 'Schedule first vet appointment' },
    { id: 8, emoji: '💉', text: 'Plan vaccination schedule' },
    { id: 9, emoji: '🧼', text: 'Puppy shampoo and grooming supplies' },
    { id: 10, emoji: '🚗', text: 'Car safety harness or carrier' },
    { id: 11, emoji: '🎓', text: 'Research puppy training classes' },
    { id: 12, emoji: '📋', text: 'Create feeding and potty schedule' },
  ];

  const handleItemCheck = (itemId: number) => {
    const newCheckedItems = new Set(checkedItems);
    if (newCheckedItems.has(itemId)) {
      newCheckedItems.delete(itemId);
    } else {
      newCheckedItems.add(itemId);
    }
    setCheckedItems(newCheckedItems);
  };

  const completionPercentage = Math.round((checkedItems.size / checklistItems.length) * 100);

  return (
    <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">🐶 New Owner Starter Pack</h2>
            <p className="text-gray-600 mb-4">Complete checklist for first-time dog owners</p>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm text-gray-600">{checkedItems.size}/{checklistItems.length} completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/50 transition-colors">
                  <Checkbox 
                    id={`item-${item.id}`}
                    checked={checkedItems.has(item.id)}
                    onCheckedChange={() => handleItemCheck(item.id)}
                    className="flex-shrink-0 h-6 w-6 border-2 border-black data-[state=checked]:bg-black data-[state=checked]:border-black"
                  />
                  <label 
                    htmlFor={`item-${item.id}`}
                    className={`flex items-center space-x-2 text-sm cursor-pointer ${
                      checkedItems.has(item.id) ? 'line-through text-gray-500' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span>{item.text}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="hidden lg:block lg:w-48 flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=200&h=200&fit=crop"
              alt="Puppy care"
              className="rounded-lg w-full h-48 object-cover"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
