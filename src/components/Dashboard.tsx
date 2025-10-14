import React from 'react';
import { MapPin, Phone, LogOut, Waves } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  user: any;
}

export function Dashboard({ user }: DashboardProps) {
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-light text-gray-800">Pilates by the Sea</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.user_metadata?.full_name || user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-6 text-white">
          <div>
            <h2 className="text-2xl font-light mb-2">Welcome to Your Pilates Journey</h2>
            <p className="opacity-90">
              Experience the harmony of mind, body, and ocean breeze in our coastal studio
            </p>
          </div>
        </div>

        {/* About Us Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">About the Studio</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Pilates by the Sea is an instructor owned studio in Ormond by the Sea. Nestled along the stunning Florida coastline, 
            we offer a unique wellness experience where the rhythm of the ocean meets the flow of mindful movement. Our intimate 
            studio provides breathtaking ocean views that inspire tranquility and focus during every session.
          </p>
          <div className="mb-6 grid md:grid-cols-2 gap-4">
            <img 
              src="/IMG_5632.jpg" 
              alt="Studio instructor in the Pilates studio"
              className="w-full h-80 object-cover object-[center_25%] rounded-lg shadow-md"
            />
            <img 
              src="/IMG_5810.jpg" 
              alt="Instructor working with client in the studio"
              className="w-full h-80 object-cover rounded-lg shadow-md"
            />
          </div>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">About Your Instructor</h3>
            <p className="text-gray-700 leading-relaxed">
              <strong>Noël Bethea</strong> is comprehensive certified with 700 hours in classical Pilates training. 
              With a background in dance and a Master of Science in Education, she brings both artistry and teaching 
              expertise to her Pilates practice. Trained in the classical repertoire, she offers tailored private 
              sessions that focus on strength, alignment, and flow.
            </p>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Founded with a passion for holistic wellness, we believe in the transformative power of Pilates to strengthen 
            both body and mind. Our experienced instructor guides you through personalized sessions designed to improve 
            flexibility, core strength, and overall well-being in our serene coastal sanctuary.
          </p>
        </div>

        {/* Pilates Offerings Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <Waves className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Private Pilates Sessions</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Classical Pilates</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Traditional Pilates method focusing on precise movements, proper alignment, and controlled breathing to build core strength and flexibility.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Tower Sessions</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                A versatile blend of springs and bars that lengthen, strengthen, and restore. Perfect for building core stability, improving posture, and moving with ease.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Matt Classes</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Floor-based Pilates exercises using body weight and small props to strengthen your core and improve posture.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Reformer for Healthy Aging</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Gentle reformer exercises designed specifically for mature adults to maintain mobility, strength, and balance as we age gracefully.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Therapeutic Pilates</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Specialized sessions designed for injury recovery, chronic pain management, and physical rehabilitation.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Pre/Post Natal Pilates</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Safe, gentle exercises designed for expecting mothers and new moms to maintain strength, prepare for childbirth, and support postpartum recovery.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Info Cards */}
        {/* Our Studio Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Waves className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Our Studio</h2>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Step into our serene coastal sanctuary where every detail has been thoughtfully designed to enhance your Pilates experience. 
            Our studio features floor-to-ceiling windows offering breathtaking ocean views, creating a tranquil atmosphere that inspires mindful movement.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src="/IMG_5919.jpg" 
                alt="Ocean view from studio location"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm font-medium">Matt Sessions</p>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src="/IMG_8664.png" 
                alt="Instructor working with client on reformer"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm font-medium">Reformer Sessions</p>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src="/IMG_5870.png" 
                alt="Instructor guiding client through exercises"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm font-medium">Personal Training</p>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src="/IMG_5942.png" 
                alt="Instructor and client working together"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm font-medium">One-on-One Sessions</p>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src="/FullSizeRender.png" 
                alt="Studio space and equipment"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm font-medium">Ocean Setting</p>
              </div>
            </div>
            
            <div className="relative overflow-hidden rounded-lg">
              <img 
                src="/outside.png" 
                alt="Outside view of the studio"
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm font-medium">Studio Photo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Studio Location</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              140 Via Madrid Drive<br />
              Ormond Beach, FL 32176<br />
              Beautiful Florida Coast
            </p>
            <div className="mt-4">
              <a
                href="https://www.google.com/maps/search/?api=1&query=140+Via+Madrid+Drive,+Ormond+Beach,+FL+32176"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MapPin className="w-4 h-4 mr-2" />
                View on Google Maps
              </a>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Contact & Email</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Phone: (386) 387-1738<br />
              pilatesbts@gmail.com
            </p>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Class Policies</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• All sessions are by appointment only</li>
              <li>• A minimum of 24-hour's notice is required to cancel or reschedule</li>
              <li>• Late cancellation or no-show will be charged the full session fee</li>
              <li>• Payment is due at the time of booking or before session</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">What to Expect</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Arrivals & Attire</h4>
                <ul className="space-y-1">
                  <li>• Please arrive on time — sessions cannot be extended for late arrivals.</li>
                  <li>• Wear comfortable, form-fitting clothing (no zippers).</li>
                  <li>• Grip socks are recommended for safety.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Health & Safety</h4>
                <ul className="space-y-1">
                  <li>• A completed intake/waiver form is required before your first session.</li>
                  <li>• Please inform me of any changes in your health, injuries, or surgeries.</li>
                  <li>• Equipment is sanitized after every use.</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Studio Etiquette</h4>
                <ul className="space-y-1">
                  <li>• Cell phones silenced during sessions.</li>
                  <li>• Only water bottles with lids in the studio.</li>
                  <li>• Please respect the equipment and space.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}