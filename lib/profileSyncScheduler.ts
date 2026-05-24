import { syncAfterProfileChange } from './habitSync';

let activeUserId: string | undefined;

export function setProfileSyncUserId(userId: string | undefined): void {
  activeUserId = userId;
}

export function scheduleProfileSync(): void {
  if (!activeUserId) return;
  void syncAfterProfileChange(activeUserId);
}
