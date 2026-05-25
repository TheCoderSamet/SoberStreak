import { Href, useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { View } from 'react-native';
import {
  Award,
  BarChart3,
  HeartPulse,
  Palette,
  RefreshCw,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { SettingRow } from '../../components/SettingRow';
import { SettingsSection } from '../../components/SettingsSection';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { ThemedText } from '../../components/ui/ThemedText';
import { syncAllUserData } from '../../lib/dataSync';
import { statusPillStyle, themedIconWrap } from '../../lib/themeStyles';
import { getDisplayNameFromUser } from '../../lib/authUser';
import { useAuthStore } from '../../store/useAuthStore';
import {
  getPremiumStatusLabel,
  useSubscriptionStore,
} from '../../store/useSubscriptionStore';
import { useSyncStore } from '../../store/useSyncStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useUserStore } from '../../store/useUserStore';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function HubCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <Card className={className}>{children}</Card>;
}

function formatLastSynced(iso: string | undefined): string {
  if (!iso) return 'Not synced yet';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return 'Unknown';
  }
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const user = useAuthStore((s) => s.user);
  const profile = useUserStore((s) => s.profile);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const premiumLoading = useSubscriptionStore((s) => s.loading);
  const premiumSource = useSubscriptionStore((s) => s.source);
  const fetchPremiumStatus = useSubscriptionStore((s) => s.fetchPremiumStatus);
  const premiumStatusLabel = useSubscriptionStore(getPremiumStatusLabel);
  const syncing = useSyncStore((s) => s.syncing);
  const lastSyncedAt = useSyncStore((s) => s.lastSyncedAt);
  const lastSyncError = useSyncStore((s) => s.lastError);
  const themeMode = useThemeStore((s) => s.mode);

  const displayName = user ? getDisplayNameFromUser(user) : null;
  const userEmail = user?.email ?? null;
  const themeLabel =
    themeMode === 'system' ? 'System' : themeMode === 'light' ? 'Light' : 'Dark';

  return (
    <ScreenContainer scroll>
      <ThemedText variant="title" className="text-3xl font-bold">
        Settings
      </ThemedText>
      <ThemedText variant="muted" className="mt-2 text-base leading-6">
        Manage your account and app preferences.
      </ThemedText>

      <SettingsSection title="Account">
        <HubCard>
          {user ? (
            <>
              <View className="flex-row items-center">
                <View
                  className="mr-4 h-14 w-14 items-center justify-center rounded-full"
                  style={themedIconWrap(colors, isDark, 'primary')}
                >
                  <ThemedText variant="primary" className="text-lg font-bold">
                    {getInitials(displayName ?? '')}
                  </ThemedText>
                </View>
                <View className="flex-1">
                  <ThemedText className="text-lg font-semibold">{displayName}</ThemedText>
                  <ThemedText variant="muted" className="mt-0.5 text-sm">
                    {userEmail}
                  </ThemedText>
                  <View className="mt-2 flex-row flex-wrap gap-2">
                    <View className="rounded-full px-2.5 py-0.5" style={statusPillStyle(colors, isDark, 'neutral')}>
                      <ThemedText variant="muted" className="text-xs font-medium">
                        Signed in
                      </ThemedText>
                    </View>
                    <View
                      className="rounded-full px-2.5 py-0.5"
                      style={statusPillStyle(colors, isDark, isPremium ? 'success' : 'neutral')}
                    >
                      <ThemedText
                        variant={isPremium ? 'success' : 'muted'}
                        className="text-xs font-medium"
                      >
                        {isPremium ? 'Premium' : 'Free'}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </View>
              <View className="mt-4">
                <Button
                  title="Account Details"
                  variant="secondary"
                  onPress={() => router.push('/account' as Href)}
                />
              </View>
            </>
          ) : (
            <>
              <ThemedText className="text-base font-semibold">Sign in required</ThemedText>
              <ThemedText variant="muted" className="mt-2 text-sm leading-5">
                Sign in with your email to connect this device to your account.
              </ThemedText>
              <View className="mt-4">
                <Button
                  title="Sign In"
                  variant="primary"
                  onPress={() => router.push('/(auth)/login' as Href)}
                />
              </View>
            </>
          )}
        </HubCard>
      </SettingsSection>

      <SettingsSection title="Preferences">
        <HubCard>
          <SettingRow
            title="Appearance & notifications"
            subtitle={`Theme: ${themeLabel} · Reminders: ${profile.notificationsEnabled ? 'On' : 'Off'}`}
            icon={Palette}
            onPress={() => router.push('/preferences' as Href)}
            isLast
          />
        </HubCard>
      </SettingsSection>

      <SettingsSection title="Premium">
        <HubCard>
          <ThemedText className="text-base font-semibold">Premium Tools</ThemedText>
          <ThemedText variant="muted" className="mt-1 text-sm leading-5">
            Journal, statistics, community, and multiple habits.
          </ThemedText>
          <ThemedText variant="muted" className="mt-3 text-sm">
            Status: {premiumStatusLabel}
          </ThemedText>
          {premiumSource === 'server' ? (
            <ThemedText variant="muted" className="mt-1 text-xs">
              Plan from account
            </ThemedText>
          ) : null}
          {user ? (
            <View className="mt-3">
              <Button
                title={premiumLoading ? 'Refreshing…' : 'Refresh plan status'}
                variant="secondary"
                disabled={premiumLoading}
                onPress={() => void fetchPremiumStatus(user.id)}
              />
            </View>
          ) : null}
          <View className="mt-4">
            <SettingRow
              title="Statistics"
              icon={BarChart3}
              onPress={() => router.push('/statistics' as Href)}
            />
            <SettingRow
              title="Community"
              icon={Users}
              onPress={() => router.push('/community' as Href)}
            />
            <SettingRow
              title="Membership plans"
              subtitle="Monthly, 6-month, and yearly"
              icon={Sparkles}
              onPress={() => router.push('/paywall' as Href)}
              isLast
            />
          </View>
        </HubCard>
      </SettingsSection>

      <SettingsSection title="Cloud sync">
        <HubCard>
          <ThemedText className="text-base font-semibold">Backup sync</ThemedText>
          <ThemedText variant="muted" className="mt-1 text-sm leading-5">
            Habits, journal entries, and progress history sync to your account when online.
          </ThemedText>
          <ThemedText variant="muted" className="mt-3 text-sm">
            Last synced: {formatLastSynced(lastSyncedAt)}
          </ThemedText>
          {lastSyncError ? (
            <ThemedText variant="danger" className="mt-2 text-sm leading-5">
              {lastSyncError}
            </ThemedText>
          ) : null}
          <View className="mt-4">
            <Button
              title={syncing ? 'Syncing…' : 'Sync now'}
              variant="secondary"
              disabled={!user || syncing}
              onPress={() => {
                if (!user) return;
                void syncAllUserData(user.id);
              }}
            />
          </View>
        </HubCard>
      </SettingsSection>

      <SettingsSection title="Progress & support">
        <HubCard>
          <SettingRow
            title="Emergency Help"
            subtitle="Breathing exercise and support lines"
            icon={HeartPulse}
            onPress={() => router.push('/emergency' as Href)}
            danger
          />
          <SettingRow
            title="Start Again"
            subtitle={isPremium ? 'Reset your quit date with care' : 'Premium feature'}
            icon={RefreshCw}
            onPress={() =>
              isPremium ? router.push('/relapse' as Href) : router.push('/paywall' as Href)
            }
          />
          <SettingRow
            title="Milestones"
            subtitle="View your achievement badges"
            icon={Award}
            onPress={() => router.push('/milestones' as Href)}
            isLast
          />
        </HubCard>
      </SettingsSection>

      <SettingsSection title="Privacy">
        <HubCard>
          <ThemedText variant="muted" className="text-sm leading-5">
            Manage your data, reset options, and privacy preferences.
          </ThemedText>
          <View className="mt-4">
            <SettingRow
              title="Data & Privacy"
              subtitle="Reset options and privacy notes"
              icon={Shield}
              onPress={() => router.push('/data-privacy' as Href)}
              isLast
            />
          </View>
        </HubCard>
      </SettingsSection>

      <View className="mb-6 items-center pt-2">
        <ThemedText variant="muted" className="text-xs font-semibold uppercase tracking-widest">
          Sober Streak
        </ThemedText>
        <ThemedText variant="muted" className="mt-1 text-xs">
          Version 1.0.0
        </ThemedText>
      </View>
    </ScreenContainer>
  );
}
