import React, { useState, useEffect, useCallback } from 'react';
import { View, StatusBar, SafeAreaView, LogBox, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import * as Font from 'expo-font';
import AppContainer from './src/Routes';
import Colors from './src/utils/Colors';

LogBox.ignoreLogs([
  'Sending `onAnimatedValueUpdate` with no listeners registered.'
]);

function fetchFonts () {
  return Font.loadAsync({
    'custom-icons': require('./src/assets/fonts/fontello.ttf'),
    'roboto-medium': require('./src/assets/fonts/Roboto-Medium.ttf')
  });
};

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await fetchFonts();
        // set the Android navigation bar to light instead of dark
        if (Platform.OS === 'android') {
          NavigationBar.setBackgroundColorAsync('white');
          NavigationBar.setButtonStyleAsync('dark');
        }
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setDataLoaded(true);
      }
    }

    prepare ();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (dataLoaded) {
      //await SplashScreen.hideAsync();
    }
  }, [dataLoaded]);

  if (!dataLoaded) {
    //return (<LoadingSpinner color='#cc5200'/>);   // <-- use built in component 'ActivityIndicator'
    return;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.theme }}>
        <StatusBar
          backgroundColor={Colors.theme}
          barStyle="dark-content"
          //hidden  // <-- use when screen recording
        />
        {/*Platform.OS === 'android' ? <View style={{ height: StatusBar.currentHeight }}/> : null*/}
        <AppContainer/>
      </SafeAreaView>
    </View>
  );
}