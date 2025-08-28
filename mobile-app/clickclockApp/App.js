import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import WorldTab from './tabs/WorldTab';
import StopwatchTab from './tabs/Stopwatch';
const Tab = createBottomTabNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name = "World Time"
          component = {WorldTab}
        />
        <Tab.Screen
          name = "Stopwatch"
          component = {StopwatchTab}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 80,
    paddingHorizontal: 20,
    backgroundColor: '#2b3e50', // fallback solid color if no gradient
  },

  h1: {
    fontSize: 55,
    marginBottom: 20,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.47)', // #ffffff78 alpha
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    top: -60,
  },

  h2: {
    fontSize: 35,
    marginBottom: 0,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.47)', // #ffffff78 alpha
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    top: -40,
  },

  inputGroup: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },

  textInput: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 25,
    borderRadius: 10,
    fontSize: 16,
    width: 260,
    maxWidth: '100%',
    backgroundColor: '#fff',

    //shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  textInputFocused: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
  },

  button: {
    backgroundColor: '#667eb6ff',
    minWidth: 140,
    paddingVertical: 15,
    paddingHorizontal: 20, // increase horizontal padding
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',  // add vertical centering
    alignSelf: 'center',
    flexGrow: 0,
    marginBottom: 30,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  sendbutton: {
    backgroundColor: '#667eb6ff',
    minWidth: 140,
    paddingVertical: 15,
    paddingHorizontal: 20, // increase horizontal padding
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',  // add vertical centering
    alignSelf: 'center',
    flexGrow: 1,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  copyButton: {
    backgroundColor: '#667eb6ff',
    minWidth: 140,
    marginTop: 15,
    paddingVertical: 15,
    paddingHorizontal: 20, // increase horizontal padding
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',  // add vertical centering
    alignSelf: 'center',
    flexGrow: 0,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  buttonPressed: {
    borderWidth: 2,
    borderColor: 'yellow',
    shadowColor: 'yellow',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 23,
    fontWeight: 'bold',
  },

  buttonToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10, // or whatever spacing you want
  },

  toggleLabel: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
  },

  chatBox: {
    paddingVertical: 2,
    paddingHorizontal: 16,
    marginTop: 40,
    borderRadius: 10,
    fontSize: 16,
    maxWidth: 300,
    maxHeight: 300,
    backgroundColor: '#fff',
    flexGrow: 1,

    //shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  result: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginTop: 0,

    // shadows:
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },

  resultText: {
    color: 'rgba(255, 255, 255, 0.87)',
    textAlign: 'center',
    fontSize: 30,
  }
});