import { captureRef } from 'react-native-view-shot';

// Native: renders the share card to a 1080x1920 PNG file and returns its uri
// (the second argument is only used by the web version)
export default function captureCard(ref) {
  return captureRef(ref, { format: 'png', quality: 1, width: 1080, height: 1920 });
}
