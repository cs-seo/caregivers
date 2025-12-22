import { NextResponse } from 'next/server';

// Mock data for caregivers
const mockCaregivers = [
  {
    id: 'c1',
    name: 'Sarah Johnson',
    status: 'online' as const,
    location: 'Building A, Floor 2',
    lastSeen: 'just now',
  },
  {
    id: 'c2',
    name: 'Michael Chen',
    status: 'busy' as const,
    location: 'Room 205',
    lastSeen: '2 minutes ago',
  },
  {
    id: 'c3',
    name: 'Emma Williams',
    status: 'offline' as const,
    location: 'Off-site',
    lastSeen: '1 hour ago',
  },
  {
    id: 'c4',
    name: 'David Martinez',
    status: 'online' as const,
    location: 'Main Reception',
    lastSeen: 'just now',
  },
  {
    id: 'c5',
    name: 'Lisa Anderson',
    status: 'busy' as const,
    location: 'Conference Room',
    lastSeen: '5 minutes ago',
  },
];

export async function GET() {
  // Simulate some dynamic status changes for demo purposes
  const caregivers = mockCaregivers.map((caregiver) => {
    // Randomly change status to simulate real-time updates
    const statuses = ['online', 'busy', 'offline'] as const;
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      ...caregiver,
      status: Math.random() > 0.3 ? caregiver.status : randomStatus,
    };
  });

  return NextResponse.json(caregivers, {
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
      'Content-Type': 'application/json',
    },
  });
}
