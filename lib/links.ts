import { Alert, Linking } from 'react-native';

// Linking.openURL REJECTS when the OS can't handle a URL — a scheme-less
// website from the imported data ('www.example.org'), prose in a phone field
// ('call for info'), or a deleted Apple Maps app all produced silently dead
// buttons before. Every user-facing link goes through these helpers so the
// button either works or explains itself.

export function normalizeWebUrl(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export async function openWebUrl(url: string | null | undefined): Promise<void> {
  if (!url || !url.trim()) {
    Alert.alert('No website', 'No website is listed for this.');
    return;
  }
  try {
    await Linking.openURL(normalizeWebUrl(url));
  } catch {
    Alert.alert('Could not open link', 'This link appears to be invalid or unavailable.');
  }
}

export async function openPhone(phone: string | null | undefined): Promise<void> {
  const digits = (phone ?? '').replace(/[^0-9+]/g, '');
  if (!digits) {
    Alert.alert('No phone number', 'No valid phone number is listed. Check the website or visit in person.');
    return;
  }
  try {
    await Linking.openURL(`tel:${digits}`);
  } catch {
    Alert.alert('Could not start call', `Please dial ${phone} manually.`);
  }
}

export async function openEmail(email: string | null | undefined): Promise<void> {
  const trimmed = (email ?? '').trim();
  if (!trimmed || !trimmed.includes('@')) {
    Alert.alert('No email', 'No valid email address is listed.');
    return;
  }
  try {
    await Linking.openURL(`mailto:${trimmed}`);
  } catch {
    Alert.alert('Could not open email', `Please email ${trimmed} from your mail app.`);
  }
}

// Google Maps web URLs open in a browser on every device, so they can't
// dead-end the way the maps:// scheme does when Apple Maps is deleted.
export async function openDirections(query: string): Promise<void> {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Could not open maps', 'Please search for this address in your maps app.');
  }
}
