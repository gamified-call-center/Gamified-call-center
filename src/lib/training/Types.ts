export type TrainingType = "video" | "image" | "pdf";

export type TrainingItem = {
  id: string | number;
  title: string;
  type: TrainingType;
  src: string;
  completed?: boolean;
  viewedTime?: number;
  lastAccessed?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type UserProgress = {
  userId: string;
  completedChapters: number;
  totalTimeSpent: number;
  streakDays: number;
  lastActive: Date;
};