import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useUpdateFriend } from '@/hooks/useUpdateFriend';
import { useArchiveFriend } from '@/hooks/useArchiveFriend';
import {
  CADENCE_OPTIONS,
  PLANT_TYPES,
  TAGS,
  TAG_TO_PLANT_TYPE_DEFAULT,
  type CadenceDays,
  type PlantType,
  type Tag,
} from '@/lib/constants';
import {
  cancelBirthdayNotifications,
  ensureNotificationPermission,
  scheduleBirthdayNotifications,
} from '@/lib/birthdayNotifications';
import type { FriendRow } from '@/db/queries/friends';

interface SettingsTabProps {
  friend: FriendRow;
}

function ChipRow<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: readonly T[];
  value: T;
  onSelect: (v: T) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((option) => (
        <Pressable
          key={option}
          onPress={() => onSelect(option)}
          style={[styles.chip, option === value && styles.chipActive]}
        >
          <ThemedText type={option === value ? 'smallBold' : 'small'}>{option}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

export function SettingsTab({ friend }: SettingsTabProps) {
  const theme = useTheme();
  const router = useRouter();
  const updateFriend = useUpdateFriend();
  const { archive } = useArchiveFriend();

  const [name, setName] = useState(friend.name);
  const [tag, setTag] = useState(friend.tag as Tag);
  const [plantType, setPlantType] = useState(friend.plantType as PlantType);
  const [cadenceDays, setCadenceDays] = useState(friend.cadenceDays as CadenceDays);
  const [phone, setPhone] = useState(friend.phone ?? '');
  const [email, setEmail] = useState(friend.email ?? '');
  const [bio, setBio] = useState(friend.bio ?? '');
  const [location, setLocation] = useState(friend.location ?? '');
  const [lowTouch, setLowTouch] = useState(friend.lowTouch);
  const [birthdayMonth, setBirthdayMonth] = useState(friend.birthdayMonth?.toString() ?? '');
  const [birthdayDay, setBirthdayDay] = useState(friend.birthdayDay?.toString() ?? '');
  const [birthdayYear, setBirthdayYear] = useState(friend.birthdayYear?.toString() ?? '');
  const [saving, setSaving] = useState(false);

  const handleTagChange = (nextTag: (typeof TAGS)[number]) => {
    setTag(nextTag);
    setPlantType(TAG_TO_PLANT_TYPE_DEFAULT[nextTag]);
  };

  const handleSave = async () => {
    setSaving(true);

    const month = parseInt(birthdayMonth, 10);
    const day = parseInt(birthdayDay, 10);
    const year = parseInt(birthdayYear, 10);
    const hasBirthday = Number.isInteger(month) && month >= 1 && month <= 12 && Number.isInteger(day) && day >= 1 && day <= 31;

    await updateFriend(friend.id, {
      name: name.trim(),
      tag,
      plantType,
      cadenceDays,
      phone: phone.trim() || null,
      email: email.trim() || null,
      bio: bio.trim() || null,
      location: location.trim() || null,
      lowTouch,
      birthdayMonth: hasBirthday ? month : null,
      birthdayDay: hasBirthday ? day : null,
      birthdayYear: Number.isInteger(year) ? year : null,
    });

    if (hasBirthday) {
      const granted = await ensureNotificationPermission();
      if (granted) {
        await scheduleBirthdayNotifications({ id: friend.id, name: name.trim(), birthdayMonth: month, birthdayDay: day });
      }
    } else {
      await cancelBirthdayNotifications(friend.id);
    }

    setSaving(false);
  };

  const setSnooze = async (days: number | null) => {
    await updateFriend(friend.id, {
      snoozeUntil: days === null ? null : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
    });
  };

  const isSnoozed = friend.snoozeUntil !== null && new Date(friend.snoozeUntil) > new Date();

  const handleArchive = () => {
    Alert.alert(
      `Archive ${friend.name}?`,
      'They’ll disappear from your garden, Today, and Dashboard, but their contact history is kept and you can unarchive them anytime from the archive list.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            await archive(friend);
            router.back();
          },
        },
      ],
    );
  };

  const inputStyle = [
    styles.input,
    { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected },
  ];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.field}>
        <ThemedText type="smallBold">Name</ThemedText>
        <TextInput
          style={inputStyle}
          value={name}
          onChangeText={setName}
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Tag</ThemedText>
        <ChipRow options={TAGS} value={tag} onSelect={handleTagChange} />
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Plant type</ThemedText>
        <ChipRow options={PLANT_TYPES} value={plantType} onSelect={setPlantType} />
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Cadence</ThemedText>
        <View style={styles.chipRow}>
          {CADENCE_OPTIONS.map((option) => (
            <Pressable
              key={option.days}
              onPress={() => setCadenceDays(option.days)}
              style={[styles.chip, cadenceDays === option.days && styles.chipActive]}
            >
              <ThemedText type={cadenceDays === option.days ? 'smallBold' : 'small'}>
                {option.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Phone</ThemedText>
        <TextInput
          style={inputStyle}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Email</ThemedText>
        <TextInput
          style={inputStyle}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Location</ThemedText>
        <TextInput
          style={inputStyle}
          value={location}
          onChangeText={setLocation}
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Birthday</ThemedText>
        <View style={styles.birthdayRow}>
          <TextInput
            style={[...inputStyle, styles.birthdayInput]}
            value={birthdayMonth}
            onChangeText={setBirthdayMonth}
            placeholder="MM"
            keyboardType="number-pad"
            maxLength={2}
            placeholderTextColor={theme.textSecondary}
          />
          <TextInput
            style={[...inputStyle, styles.birthdayInput]}
            value={birthdayDay}
            onChangeText={setBirthdayDay}
            placeholder="DD"
            keyboardType="number-pad"
            maxLength={2}
            placeholderTextColor={theme.textSecondary}
          />
          <TextInput
            style={[...inputStyle, styles.birthdayYearInput]}
            value={birthdayYear}
            onChangeText={setBirthdayYear}
            placeholder="YYYY (optional)"
            keyboardType="number-pad"
            maxLength={4}
            placeholderTextColor={theme.textSecondary}
          />
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Set a month and day to get a nudge the day before and the day of.
        </ThemedText>
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Bio</ThemedText>
        <TextInput
          style={[...inputStyle, styles.multiline]}
          value={bio}
          onChangeText={setBio}
          multiline
          placeholderTextColor={theme.textSecondary}
        />
      </View>

      <View style={[styles.field, styles.row]}>
        <ThemedText type="smallBold">Low touch — never urgent, never red</ThemedText>
        <Switch value={lowTouch} onValueChange={setLowTouch} />
      </View>

      <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <ThemedText type="smallBold" themeColor="background">
          {saving ? 'Saving…' : 'Save'}
        </ThemedText>
      </Pressable>

      <View style={styles.field}>
        <ThemedText type="smallBold">Snooze</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {isSnoozed ? `Resting until ${new Date(friend.snoozeUntil!).toLocaleDateString()}` : 'Not snoozed'}
        </ThemedText>
        <View style={styles.chipRow}>
          <Pressable style={styles.chip} onPress={() => setSnooze(7)}>
            <ThemedText type="small">1 week</ThemedText>
          </Pressable>
          <Pressable style={styles.chip} onPress={() => setSnooze(30)}>
            <ThemedText type="small">1 month</ThemedText>
          </Pressable>
          <Pressable style={styles.chip} onPress={() => setSnooze(null)}>
            <ThemedText type="small">Clear</ThemedText>
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.archiveButton} onPress={handleArchive}>
        <ThemedText type="smallBold" style={styles.archiveButtonText}>
          Archive {friend.name}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 20,
  },
  field: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    borderWidth: 1,
    borderColor: '#C9CDD3',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  birthdayRow: {
    flexDirection: 'row',
    gap: 8,
  },
  birthdayInput: {
    width: 56,
    textAlign: 'center',
  },
  birthdayYearInput: {
    flex: 1,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#C9CDD3',
  },
  chipActive: {
    backgroundColor: '#7CB342',
    borderColor: '#7CB342',
  },
  saveButton: {
    backgroundColor: '#333333',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  archiveButton: {
    borderWidth: 1,
    borderColor: '#E4572E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  archiveButtonText: {
    color: '#E4572E',
  },
});
