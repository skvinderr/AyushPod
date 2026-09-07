import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Patient from '@/models/Patient';
import KioskSession from '@/models/KioskSession';

export async function GET() {
  try {
    await dbConnect();

    // Clear existing data (optional, but good for a fresh seed)
    await Patient.deleteMany({});
    await KioskSession.deleteMany({});

    // Create a sample patient
    const patient1 = await Patient.create({
      phoneNumber: '9876543210',
      name: 'Rahul Sharma',
      age: 34,
      gender: 'Male',
      bloodGroup: 'O+',
      address: '123 Main St, New Delhi, India'
    });

    const patient2 = await Patient.create({
      phoneNumber: '9123456780',
      name: 'Priya Patel',
      age: 28,
      gender: 'Female',
      bloodGroup: 'A+',
      address: '456 MG Road, Mumbai, India'
    });

    // Create Kiosk Sessions for them
    await KioskSession.create({
      patientId: patient1._id,
      kioskId: 'KIOSK_DEL_01',
      sessionType: 'NEW_REGISTRATION',
      status: 'COMPLETED'
    });

    await KioskSession.create({
      patientId: patient1._id,
      kioskId: 'KIOSK_DEL_01',
      sessionType: 'LOGIN',
      status: 'ACTIVE'
    });

    await KioskSession.create({
      patientId: patient2._id,
      kioskId: 'KIOSK_MUM_02',
      sessionType: 'NEW_REGISTRATION',
      status: 'COMPLETED'
    });

    return NextResponse.json({ message: 'Database successfully seeded!', success: true });
  } catch (error: any) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: 'Failed to seed database', details: error.message, stack: error.stack }, { status: 500 });
  }
}
