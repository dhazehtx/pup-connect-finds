
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Eye, EyeOff } from 'lucide-react';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
});

type SignUpData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSubmit: (data: SignUpData) => Promise<void>;
  loading: boolean;
}

const SignUpForm = ({ onSubmit, loading }: SignUpFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      username: '',
    },
    mode: 'onChange',
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Full Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  disabled={loading}
                  {...field}
                  className="h-11 border-gray-300 rounded-none focus:border-black focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Username</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Choose a username"
                  disabled={loading}
                  {...field}
                  className="h-11 border-gray-300 rounded-none focus:border-black focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  disabled={loading}
                  {...field}
                  className="h-11 border-gray-300 rounded-none focus:border-black focus:ring-0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    disabled={loading}
                    className="h-11 border-gray-300 rounded-none focus:border-black focus:ring-0 pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-black hover:bg-gray-800 text-white rounded-none font-medium"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Creating Account...
            </>
          ) : (
            <>
              <User size={16} className="mr-2" />
              Create Account
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SignUpForm;
