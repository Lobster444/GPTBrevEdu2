import React from 'react';
import { Star, MessageCircle, Clock, Shield, Check } from 'lucide-react';

const BrevEduPlus: React.FC = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'AI Chat Sessions',
      description: '3 AI-powered conversations daily to deepen your learning',
      highlight: 'vs 1 for free users',
    },
    {
      icon: Clock,
      title: 'Extended Chat Time',
      description: '5-minute focused sessions with personalized AI guidance',
      highlight: 'Maximize retention',
    },
    {
      icon: Shield,
      title: 'Premium Content',
      description: 'Access exclusive courses and advanced skill modules',
      highlight: 'New content weekly',
    },
    {
      icon: Star,
      title: 'Priority Support',
      description: 'Get help when you need it with premium support',
      highlight: '24/7 availability',
    },
  ];

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/forever',
      features: [
        '3 featured courses',
        '1 AI chat session/day',
        'Basic course library',
        'Community support',
      ],
      buttonText: 'Current Plan',
      buttonClass: 'bg-dark-tertiary text-gray-300 cursor-not-allowed',
      isPopular: false,
    },
    {
      name: 'BrevEdu Plus',
      price: '$3.99',
      period: '/month',
      features: [
        'All courses (50+)',
        '3 AI chat sessions/day',
        'Premium-only content',
        'Priority support',
        'Offline downloads',
        'Progress tracking',
      ],
      buttonText: 'Upgrade Now',
      buttonClass: 'bg-yellow-primary hover:bg-yellow-dark text-black font-semibold',
      isPopular: true,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-yellow-primary p-3 rounded-2xl">
            <Star className="w-8 h-8 text-black" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Unlock Your Full 
          <span className="text-yellow-primary"> Learning Potential</span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Get unlimited access to premium courses and triple your AI chat sessions for just $3.99/month
        </p>
        <button className="bg-yellow-primary hover:bg-yellow-dark text-black px-8 py-3 rounded-xl font-semibold transition-colors">
          Start 7-Day Free Trial
        </button>
      </div>

      {/* Features Grid */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Why Choose BrevEdu Plus?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-dark-secondary rounded-2xl p-6 hover:bg-dark-tertiary transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-primary p-3 rounded-xl">
                  <feature.icon className="w-6 h-6 text-black" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 mb-2">
                    {feature.description}
                  </p>
                  <span className="text-yellow-primary text-sm font-medium">
                    {feature.highlight}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Choose Your Plan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-dark-secondary rounded-2xl p-8 ${
                plan.isPopular ? 'ring-2 ring-yellow-primary' : ''
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-primary text-black px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center mb-4">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-400 ml-1">
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-yellow-primary flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-xl transition-colors ${plan.buttonClass}`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6 max-w-3xl mx-auto text-left">
          <div className="bg-dark-secondary rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Can I cancel anytime?
            </h3>
            <p className="text-gray-300">
              Yes! You can cancel your subscription at any time. Your access will continue until the end of your billing period.
            </p>
          </div>
          <div className="bg-dark-secondary rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              What happens to my AI chat limits?
            </h3>
            <p className="text-gray-300">
              With BrevEdu Plus, you get 3 AI chat sessions per day instead of 1. Sessions reset daily at midnight.
            </p>
          </div>
          <div className="bg-dark-secondary rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Do you offer refunds?
            </h3>
            <p className="text-gray-300">
              We offer a 7-day free trial, and if you're not satisfied within the first 30 days, we'll provide a full refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrevEduPlus;