export interface Queue {
  queueId: string;
  number: number;
  called: boolean;
  createdAt: Date;
  calledAt: Date | null;
  lineNotifyId: string | null;
}
