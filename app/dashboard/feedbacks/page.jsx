'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { API_URL } from '@/helpers/apiUrl';
import { createApiRequest } from '@/helpers/axios';
import FeedbacksCardView from '@/components/dashboard/FeedbacksCardView';

const FeedbacksPage = () => {
  const [statistics, setStatistics] = useState({
    total: 0,
    positive_percentage: 0,
    neutral_percentage: 0,
    negative_percentage: 0,
    average_rating: 0,
  });
  const [loading, setLoading] = useState(true);

  const commandApi = useMemo(() => createApiRequest(API_URL), []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await commandApi.get('/api/feedbacks/statistics');
      if (response && response.status === 'success') {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return (
    <div className="w-full p-6 space-y-6">
      {/* Feedback Statistics */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {loading ? '...' : `${statistics.positive_percentage}%`}
            </div>
            <div className="text-sm text-green-700">Positive</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? '...' : `${statistics.neutral_percentage}%`}
            </div>
            <div className="text-sm text-yellow-700">Neutral</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {loading ? '...' : `${statistics.negative_percentage}%`}
            </div>
            <div className="text-sm text-red-700">Negative</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                         <div className="text-2xl font-bold text-blue-600">
               {loading ? '...' : (parseFloat(statistics.average_rating) || 0).toFixed(1)}
             </div>
            <div className="text-sm text-blue-700">Avg Rating</div>
          </div>
        </div>
      </div>

      {/* Dynamic Feedbacks Card View */}
      <FeedbacksCardView />
    </div>
  );
};

export default FeedbacksPage; 