import { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit2, Save, X, CheckCircle, Shield } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export default function MyProfile() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: ''
  });
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    savedAddresses: 0
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch orders
      const ordersResponse = await api.get('/orders/my-orders/');
      const orders = ordersResponse.data.orders || ordersResponse.data || [];
      
      // Fetch addresses
      const addressesResponse = await api.get('/addresses/');
      const addresses = addressesResponse.data || [];
      
      // Calculate stats
      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
      const savedAddresses = addresses.length;
      
      setStats({
        totalOrders,
        totalSpent,
        savedAddresses
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile/');
      setProfile(response.data);
      setFormData({ full_name: response.data.full_name || '' });
    } catch (error) {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await api.put('/users/profile/', formData);
      setProfile(response.data);
      setEditing(false);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleCancel = () => {
    setFormData({ full_name: profile.full_name || '' });
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="text-lg font-medium text-gray-900">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header with avatar */}
          <div className="h-32 bg-gray-700 relative">
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
                <div className="w-full h-full bg-gray-800 rounded-full flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 pb-8 px-8">
            {/* Name Section */}
            <div className="text-center mb-8">
              {editing ? (
                <div className="max-w-md mx-auto">
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full text-center text-2xl font-bold border-2 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-black"
                    placeholder="Enter your name"
                  />
                </div>
              ) : (
                <h2 className="text-3xl font-bold text-gray-900 mb-1">
                  {profile.full_name || 'User'}
                </h2>
              )}
              <p className="text-gray-500 text-sm">Member since {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 mb-8">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Info Cards Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Email Card */}
              <div className="bg-gray-100 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Email Address</p>
                    <p className="font-bold text-gray-900 break-all">{profile.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      {profile.is_email_verified ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                          Not Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div className="bg-gray-100 rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="font-bold text-gray-900">
                      {profile.phone_number || 'Not provided'}
                    </p>
                    {profile.phone_number && (
                      <div className="mt-2 flex items-center gap-2">
                        {profile.is_phone_verified ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                            Not Verified
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="mt-6 bg-gray-100 rounded-xl p-6 border-2 border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 mb-1">Account Security</p>
                  <p className="text-sm text-gray-600">Your account is protected with secure authentication</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-white">{stats.totalOrders}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Orders</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-white">₹{stats.totalSpent.toFixed(0)}</span>
            </div>
            <p className="text-gray-600 text-sm">Total Spent</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center transform hover:scale-105 transition">
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-white">{stats.savedAddresses}</span>
            </div>
            <p className="text-gray-600 text-sm">Saved Addresses</p>
          </div>
        </div>
      </div>
    </div>
  );
}
