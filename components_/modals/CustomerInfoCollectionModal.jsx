'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { User, Car, DollarSign, Calendar, Phone, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

const CustomerInfoCollectionModal = ({ isOpen, onClose, onSuccess, customerId = null, initialData = null }) => {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [formData, setFormData] = useState({
    // Phase 1: Vehicle Preferences
    vehicle_type: null,
    seating_capacity: null,
    model_preference: null,
    color_preference: null,
    fuel_type: null,
    condition_type: null,
    edition_package: null,
    grade_preference: null,
    mileage_preference: null,
    usage_purpose: null,

    // Phase 2: Budget Information
    budget_range: null,
    budget_flexibility: null,
    payment_method: null,
    loan_percentage: null,
    cash_ready: null,
    financial_readiness: null,

    // Phase 3: Purchase Intent
    purchase_timeline: null,
    visit_scheduled: null,
    visit_date: null,
    other_dealers_visited: null,
    comparison_info: null,
    business_card_collected: null,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Options for select fields
  const vehicleTypeOptions = [
    { value: 'saloon', label: 'Saloon' },
    { value: 'suv', label: 'SUV' },
    { value: 'mpv', label: 'MPV' },
  ];

  const seatingCapacityOptions = [
    { value: '5', label: '5 Seats' },
    { value: '7', label: '7 Seats' },
  ];

  const fuelTypeOptions = [
    { value: 'petrol', label: 'Petrol' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  const conditionTypeOptions = [
    { value: 'used', label: 'Used' },
    { value: 'reconditioned', label: 'Reconditioned' },
  ];

  const usagePurposeOptions = [
    { value: 'family', label: 'Family Use' },
    { value: 'office', label: 'Office Use' },
    { value: 'school', label: 'School Duty' },
    { value: 'rent', label: 'Rent a Car' },
  ];

  const budgetRangeOptions = [
    { value: 'under_10_lakh', label: 'Under 10 Lakh' },
    { value: '10_15_lakh', label: '10-15 Lakh' },
    { value: '15_20_lakh', label: '15-20 Lakh' },
    { value: '20_25_lakh', label: '20-25 Lakh' },
    { value: '25_30_lakh', label: '25-30 Lakh' },
    { value: 'above_30_lakh', label: 'Above 30 Lakh' },
  ];

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'loan', label: 'Bank Loan' },
  ];

  const timelineOptions = [
    { value: 'immediate', label: 'Immediate (Within 1 week)' },
    { value: '1_month', label: 'Within 1 Month' },
    { value: '3_months', label: 'Within 3 Months' },
    { value: '6_months', label: 'Within 6 Months' },
    { value: 'flexible', label: 'Flexible' },
  ];

  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      borderColor: state.isFocused ? '#3b82f6' : (errors[state.name] ? '#ef4444' : '#d1d5db'),
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : '#9ca3af'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3b82f6' : '#f3f4f6'
      }
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999
    })
  };

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [isOpen, initialData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validatePhase = (phase) => {
    const newErrors = {};

    switch (phase) {
      case 1:
        if (!formData.vehicle_type) newErrors.vehicle_type = 'Vehicle type is required';
        if (!formData.usage_purpose) newErrors.usage_purpose = 'Usage purpose is required';
        break;
      case 2:
        if (!formData.budget_range) newErrors.budget_range = 'Budget range is required';
        if (!formData.payment_method) newErrors.payment_method = 'Payment method is required';
        break;
      case 3:
        if (!formData.purchase_timeline) newErrors.purchase_timeline = 'Purchase timeline is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextPhase = () => {
    if (validatePhase(currentPhase)) {
      setCurrentPhase(prev => Math.min(prev + 1, 3));
    }
  };

  const prevPhase = () => {
    setCurrentPhase(prev => Math.max(prev - 1, 1));
  };

  const calculateSeriousnessScore = () => {
    let score = 0;
    
    // Budget information (0-30 points)
    if (formData.budget_range) score += 10;
    if (formData.payment_method) score += 10;
    if (formData.cash_ready) score += 10;
    
    // Purchase timeline (0-30 points)
    if (formData.purchase_timeline) score += 15;
    if (formData.visit_scheduled) score += 15;
    
    // Vehicle preferences (0-20 points)
    if (formData.vehicle_type) score += 10;
    if (formData.model_preference) score += 10;
    
    // Additional factors (0-20 points)
    if (formData.business_card_collected) score += 10;
    if (formData.other_dealers_visited) score += 10;
    
    return Math.min(score, 100);
  };

  const handleSubmit = async () => {
    if (!validatePhase(currentPhase)) {
      return;
    }

    setLoading(true);
    
    try {
      const seriousnessScore = calculateSeriousnessScore();
      const customerInfo = {
        ...formData,
        seriousness_score: seriousnessScore,
        collected_at: new Date().toISOString(),
      };

      onSuccess(customerInfo);
      onClose();
      toast.success('Customer information collected successfully');
    } catch (error) {
      console.error('Error saving customer info:', error);
      toast.error('Failed to save customer information');
    } finally {
      setLoading(false);
    }
  };

  const renderPhase1 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
        <Car className="w-5 h-5" />
        <span>Vehicle Preferences</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Type *
          </label>
          <Select
            value={vehicleTypeOptions.find(opt => opt.value === formData.vehicle_type)}
            onChange={(option) => handleInputChange('vehicle_type', option?.value)}
            options={vehicleTypeOptions}
            placeholder="Select vehicle type"
            styles={customStyles}
            isClearable
            name="vehicle_type"
          />
          {errors.vehicle_type && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicle_type}</p>
          )}
        </div>

        {/* Seating Capacity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seating Capacity
          </label>
          <Select
            value={seatingCapacityOptions.find(opt => opt.value === formData.seating_capacity)}
            onChange={(option) => handleInputChange('seating_capacity', option?.value)}
            options={seatingCapacityOptions}
            placeholder="Select seating capacity"
            styles={customStyles}
            isClearable
            name="seating_capacity"
          />
        </div>

        {/* Model Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Model Preference
          </label>
          <input
            type="text"
            value={formData.model_preference || ''}
            onChange={(e) => handleInputChange('model_preference', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Toyota Allion, Honda Vezel"
          />
        </div>

        {/* Color Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color Preference
          </label>
          <input
            type="text"
            value={formData.color_preference || ''}
            onChange={(e) => handleInputChange('color_preference', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., White, Black, Silver"
          />
        </div>

        {/* Fuel Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fuel Type
          </label>
          <Select
            value={fuelTypeOptions.find(opt => opt.value === formData.fuel_type)}
            onChange={(option) => handleInputChange('fuel_type', option?.value)}
            options={fuelTypeOptions}
            placeholder="Select fuel type"
            styles={customStyles}
            isClearable
            name="fuel_type"
          />
        </div>

        {/* Condition Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condition Type
          </label>
          <Select
            value={conditionTypeOptions.find(opt => opt.value === formData.condition_type)}
            onChange={(option) => handleInputChange('condition_type', option?.value)}
            options={conditionTypeOptions}
            placeholder="Select condition type"
            styles={customStyles}
            isClearable
            name="condition_type"
          />
        </div>

        {/* Usage Purpose */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Usage Purpose *
          </label>
          <Select
            value={usagePurposeOptions.find(opt => opt.value === formData.usage_purpose)}
            onChange={(option) => handleInputChange('usage_purpose', option?.value)}
            options={usagePurposeOptions}
            placeholder="Select usage purpose"
            styles={customStyles}
            isClearable
            name="usage_purpose"
          />
          {errors.usage_purpose && (
            <p className="mt-1 text-sm text-red-600">{errors.usage_purpose}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderPhase2 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
        <DollarSign className="w-5 h-5" />
        <span>Budget Information</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget Range *
          </label>
          <Select
            value={budgetRangeOptions.find(opt => opt.value === formData.budget_range)}
            onChange={(option) => handleInputChange('budget_range', option?.value)}
            options={budgetRangeOptions}
            placeholder="Select budget range"
            styles={customStyles}
            isClearable
            name="budget_range"
          />
          {errors.budget_range && (
            <p className="mt-1 text-sm text-red-600">{errors.budget_range}</p>
          )}
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method *
          </label>
          <Select
            value={paymentMethodOptions.find(opt => opt.value === formData.payment_method)}
            onChange={(option) => handleInputChange('payment_method', option?.value)}
            options={paymentMethodOptions}
            placeholder="Select payment method"
            styles={customStyles}
            isClearable
            name="payment_method"
          />
          {errors.payment_method && (
            <p className="mt-1 text-sm text-red-600">{errors.payment_method}</p>
          )}
        </div>

        {/* Loan Percentage */}
        {formData.payment_method === 'loan' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loan Percentage
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.loan_percentage || ''}
              onChange={(e) => handleInputChange('loan_percentage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 70"
            />
          </div>
        )}

        {/* Cash Ready */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cash Ready
          </label>
          <Select
            value={formData.cash_ready ? { value: true, label: 'Yes' } : formData.cash_ready === false ? { value: false, label: 'No' } : null}
            onChange={(option) => handleInputChange('cash_ready', option?.value)}
            options={[
              { value: true, label: 'Yes' },
              { value: false, label: 'No' }
            ]}
            placeholder="Is cash ready?"
            styles={customStyles}
            isClearable
            name="cash_ready"
          />
        </div>
      </div>
    </div>
  );

  const renderPhase3 = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 text-lg font-semibold text-gray-700">
        <Calendar className="w-5 h-5" />
        <span>Purchase Intent</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Purchase Timeline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purchase Timeline *
          </label>
          <Select
            value={timelineOptions.find(opt => opt.value === formData.purchase_timeline)}
            onChange={(option) => handleInputChange('purchase_timeline', option?.value)}
            options={timelineOptions}
            placeholder="Select purchase timeline"
            styles={customStyles}
            isClearable
            name="purchase_timeline"
          />
          {errors.purchase_timeline && (
            <p className="mt-1 text-sm text-red-600">{errors.purchase_timeline}</p>
          )}
        </div>

        {/* Visit Scheduled */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visit Scheduled
          </label>
          <Select
            value={formData.visit_scheduled ? { value: true, label: 'Yes' } : formData.visit_scheduled === false ? { value: false, label: 'No' } : null}
            onChange={(option) => handleInputChange('visit_scheduled', option?.value)}
            options={[
              { value: true, label: 'Yes' },
              { value: false, label: 'No' }
            ]}
            placeholder="Is visit scheduled?"
            styles={customStyles}
            isClearable
            name="visit_scheduled"
          />
        </div>

        {/* Other Dealers Visited */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Other Dealers Visited
          </label>
          <input
            type="text"
            value={formData.other_dealers_visited || ''}
            onChange={(e) => handleInputChange('other_dealers_visited', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., ABC Motors, XYZ Auto"
          />
        </div>

        {/* Business Card Collected */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Card Collected
          </label>
          <Select
            value={formData.business_card_collected ? { value: true, label: 'Yes' } : formData.business_card_collected === false ? { value: false, label: 'No' } : null}
            onChange={(option) => handleInputChange('business_card_collected', option?.value)}
            options={[
              { value: true, label: 'Yes' },
              { value: false, label: 'No' }
            ]}
            placeholder="Was business card collected?"
            styles={customStyles}
            isClearable
            name="business_card_collected"
          />
        </div>

        {/* Seriousness Score Display */}
        <div className="md:col-span-2">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Customer Seriousness Score:</span>
              <span className="text-lg font-bold text-blue-600">{calculateSeriousnessScore()}/100</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateSeriousnessScore()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Customer Information Collection
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Phase {currentPhase} of 3</span>
            <span className="text-sm text-gray-500">{Math.round((currentPhase / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentPhase / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="p-6">
          {currentPhase === 1 && renderPhase1()}
          {currentPhase === 2 && renderPhase2()}
          {currentPhase === 3 && renderPhase3()}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevPhase}
              disabled={currentPhase === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              {currentPhase < 3 ? (
                <button
                  type="button"
                  onClick={nextPhase}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save & Complete'}
                </button>
              )}
              
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoCollectionModal;
