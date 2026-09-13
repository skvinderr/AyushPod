import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKioskSession extends Document {
  patientId: mongoose.Types.ObjectId;
  kioskId?: string;
  sessionType: 'NEW_REGISTRATION' | 'LOGIN';
  loginTime: Date;
  status: 'ACTIVE' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

const KioskSessionSchema: Schema<IKioskSession> = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    kioskId: {
      type: String,
      trim: true,
    },
    sessionType: {
      type: String,
      enum: ['NEW_REGISTRATION', 'LOGIN'],
      required: true,
    },
    loginTime: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'COMPLETED'],
      default: 'ACTIVE',
    },
  },
  {
    timestamps: true,
  }
);

// To prevent OverwriteModelError in hot-reloading Next.js environments
const KioskSession: Model<IKioskSession> =
  mongoose.models.KioskSession || mongoose.model<IKioskSession>('KioskSession', KioskSessionSchema);

export default KioskSession;
