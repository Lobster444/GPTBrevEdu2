export interface Course {
  id: string
  title: string
  description: string
  duration: string
  thumbnail: string
  category: string
  instructor: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  keyPoints: string[]
  isPremium: boolean
  views: string
  rating: number
  videoId: string
  isPublished: boolean
  isFeatured: boolean
}

// Centralized course data - single source of truth
export const courses: Course[] = [
  {
    id: '1',
    title: 'Public Speaking Mastery',
    description: 'Master the art of public speaking with proven techniques to overcome fear and speak with confidence. Learn body language, voice control, and audience engagement strategies that will transform your communication skills.',
    duration: '4 min',
    thumbnail: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    category: 'Communication',
    instructor: 'Sarah Johnson',
    difficulty: 'Beginner',
    keyPoints: [
      'Overcome speaking anxiety and nervousness',
      'Master confident body language and posture',
      'Engage your audience effectively',
      'Structure compelling presentations',
      'Use voice control and pacing techniques'
    ],
    isPremium: false,
    views: '12.5k',
    rating: 4.8,
    videoId: 'dQw4w9WgXcQ',
    isPublished: true,
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Time Management Hacks',
    description: 'Discover powerful time management strategies that will help you get more done in less time. Learn prioritization techniques, productivity systems, and how to eliminate time-wasting activities.',
    duration: '3 min',
    thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    category: 'Productivity',
    instructor: 'Mike Chen',
    difficulty: 'Intermediate',
    keyPoints: [
      'Priority matrix and task categorization',
      'Time blocking and calendar management',
      'Eliminate distractions and time wasters',
      'Energy management throughout the day',
      'Automation and delegation strategies'
    ],
    isPremium: true,
    views: '8.2k',
    rating: 4.9,
    videoId: 'dQw4w9WgXcQ',
    isPublished: true,
    isFeatured: true,
  },
  {
    id: '3',
    title: 'Negotiation Basics',
    description: 'Learn fundamental negotiation skills that create win-win outcomes. Understand psychology, preparation strategies, and communication techniques that lead to successful negotiations.',
    duration: '5 min',
    thumbnail: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    category: 'Business',
    instructor: 'Lisa Rodriguez',
    difficulty: 'Beginner',
    keyPoints: [
      'Preparation and research strategies',
      'Understanding the other party\'s needs',
      'Creating win-win solutions',
      'Handling objections and pushback',
      'Closing and follow-up techniques'
    ],
    isPremium: false,
    views: '15.1k',
    rating: 4.7,
    videoId: 'dQw4w9WgXcQ',
    isPublished: true,
    isFeatured: true,
  },
  {
    id: '4',
    title: 'Email Productivity',
    description: 'Transform your email management with proven systems and techniques. Learn inbox zero methodology, email templates, and automation strategies to save hours each week.',
    duration: '3 min',
    thumbnail: 'https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    category: 'Productivity',
    instructor: 'David Park',
    difficulty: 'Beginner',
    keyPoints: [
      'Inbox Zero methodology',
      'Email templates and signatures',
      'Filtering and automation rules',
      'Scheduling and batching emails',
      'Mobile email management'
    ],
    isPremium: true,
    views: '6.8k',
    rating: 4.6,
    videoId: 'dQw4w9WgXcQ',
    isPublished: true,
    isFeatured: true,
  },
  {
    id: '5',
    title: 'Team Leadership',
    description: 'Develop essential leadership skills to inspire and guide your team to success. Learn communication, motivation, and decision-making strategies that create high-performing teams.',
    duration: '4 min',
    thumbnail: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    category: 'Leadership',
    instructor: 'Jennifer Kim',
    difficulty: 'Intermediate',
    keyPoints: [
      'Building trust and rapport',
      'Effective delegation strategies',
      'Motivating team members',
      'Conflict resolution techniques',
      'Performance feedback and coaching'
    ],
    isPremium: false,
    views: '11.3k',
    rating: 4.8,
    videoId: 'dQw4w9WgXcQ',
    isPublished: true,
    isFeatured: true,
  },
  {
    id: '6',
    title: 'Active Listening',
    description: 'Master the art of active listening to build stronger relationships and improve communication. Learn techniques to truly understand others and respond more effectively.',
    duration: '2 min',
    thumbnail: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop',
    category: 'Communication',
    instructor: 'Alex Thompson',
    difficulty: 'Beginner',
    keyPoints: [
      'Non-verbal communication cues',
      'Asking clarifying questions',
      'Paraphrasing and summarizing',
      'Avoiding interruptions and distractions',
      'Empathetic responding techniques'
    ],
    isPremium: true,
    views: '9.7k',
    rating: 4.9,
    videoId: 'dQw4w9WgXcQ',
    isPublished: true,
    isFeatured: true,
  },
]

// Helper functions for filtering courses
export const getCourseById = (id: string): Course | undefined => {
  return courses.find(course => course.id === id)
}

export const getFeaturedCourses = (): Course[] => {
  return courses.filter(course => course.isFeatured && course.isPublished)
}

export const getPremiumCourses = (): Course[] => {
  return courses.filter(course => course.isPremium && course.isPublished)
}

export const getFreeCourses = (): Course[] => {
  return courses.filter(course => !course.isPremium && course.isPublished)
}

export const getCoursesByCategory = (category: string): Course[] => {
  if (category === 'all') return courses.filter(course => course.isPublished)
  return courses.filter(course => 
    course.category.toLowerCase() === category.toLowerCase() && course.isPublished
  )
}

export const searchCourses = (searchTerm: string): Course[] => {
  const term = searchTerm.toLowerCase()
  return courses.filter(course => 
    course.isPublished && (
      course.title.toLowerCase().includes(term) ||
      course.description.toLowerCase().includes(term) ||
      course.category.toLowerCase().includes(term) ||
      course.instructor.toLowerCase().includes(term)
    )
  )
}

// Categories for filtering
export const courseCategories = [
  { id: 'all', name: 'All Courses' },
  { id: 'communication', name: 'Communication' },
  { id: 'productivity', name: 'Productivity' },
  { id: 'business', name: 'Business' },
  { id: 'leadership', name: 'Leadership' },
]