import { StyleSheet } from 'react-native';

const primaryColor = '#4F8EF7';      // Friendly blue
const accentColor = '#FFB347';       // Warm accent (orange)
const backgroundColor = '#F9FAFB';   // Very light gray
const cardColor = '#FFFFFF';         // White for cards
const borderColor = '#E5E7EB';       // Subtle border
const textColor = '#22223B';         // Dark, easy to read

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: backgroundColor,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 1,
  },
  input: {
    height: 48,
    borderColor: borderColor,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: cardColor,
    fontSize: 16,
    color: textColor,
  },
  button: {
    backgroundColor: '#4F8EF7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  link: {
    color: accentColor,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 8,
  },
  errorText: {
    color: '#E63946',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: cardColor,
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderColor: borderColor,
    borderWidth: 1,
  },
  label: {
    fontSize: 16,
    color: textColor,
    marginBottom: 6,
    fontWeight: '500',
  },
});
