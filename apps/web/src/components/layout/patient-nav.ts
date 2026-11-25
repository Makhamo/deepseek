import {
    Home, CalendarDays, MessageSquare, Pill, FlaskConical, FileText, Stethoscope, Settings,
  } from 'lucide-react';
  
  // Use this list for role="patient" in Sidebar.tsx, in this exact order.
  // NICU, Claims & Billing, Calendar and Video pages still exist and still work by URL;
  // they are just not in the patient sidebar, matching the prototype.
  export const PATIENT_NAV = [
    { href: '/portal', label: 'Home', icon: Home },
    { href: '/portal/appointments', label: 'My visits', icon: CalendarDays },
    { href: '/portal/messages', label: 'Messages', icon: MessageSquare },
    { href: '/portal/prescriptions', label: 'Medicines', icon: Pill },
    { href: '/portal/lab', label: 'Test results', icon: FlaskConical },
    { href: '/portal/documents', label: 'My documents', icon: FileText },
    { href: '/portal/doctors', label: 'Find a doctor', icon: Stethoscope },
    { href: '/portal/settings', label: 'Settings', icon: Settings },
  ];