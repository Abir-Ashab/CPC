'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Trophy, Users, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, isAuthenticated, fetchUser, isAdmin } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !user) {
      fetchUser();
    }
  }, [isAuthenticated, user, fetchUser]);

  // If user is authenticated, redirect to appropriate page
  useEffect(() => {
    if (isAuthenticated && user) {
      if (isAdmin()) {
        router.push('/admin');
      } else {
        router.push('/voting');
      }
    }
  }, [isAuthenticated, user, isAdmin, router]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-white p-4 rounded-full shadow-lg">
              <Camera className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Cefalo Photography Contest
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join our photography contest! View stunning photos submitted by our community 
            and vote for your favorites. May the best shot win!
          </p>

          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="px-8 py-3 text-lg">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/results">
                <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                  View Results
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/voting">
                <Button size="lg" className="px-8 py-3 text-lg">
                  <Trophy className="mr-2 h-5 w-5" />
                  Start Voting
                </Button>
              </Link>
              <Link href="/results">
                <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                  View Results
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple, fair, and engaging photography contest
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Browse Photos</h3>
                <p className="text-gray-600">
                  Explore amazing photos submitted by our talented community members.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Vote for Favorites</h3>
                <p className="text-gray-600">
                  Cast your vote for the photo that captures your heart. One vote per person!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">See Winners</h3>
                <p className="text-gray-600">
                  Check out the results and celebrate the top 3 winning photographs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Contest Stats
            </h2>
            <p className="text-lg text-gray-600">
              See how our community is participating
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                <Users className="h-12 w-12 mx-auto mb-4" />
                Live
              </div>
              <p className="text-lg font-medium text-gray-900">Contest Status</p>
              <p className="text-gray-600">Currently accepting votes</p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                <Camera className="h-12 w-12 mx-auto mb-4" />
                Multiple
              </div>
              <p className="text-lg font-medium text-gray-900">Photos Submitted</p>
              <p className="text-gray-600">Amazing entries to choose from</p>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                <Heart className="h-12 w-12 mx-auto mb-4" />
                Growing
              </div>
              <p className="text-lg font-medium text-gray-900">Votes Cast</p>
              <p className="text-gray-600">Community engagement</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Join the Contest?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Sign in with Google and start voting for your favorite photos today!
          </p>
          
          {!isAuthenticated ? (
            <Link href="/login">
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                Sign In & Vote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link href="/voting">
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                <Trophy className="mr-2 h-5 w-5" />
                Continue Voting
              </Button>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}