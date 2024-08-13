import WebView from "react-native-webview";
import { StatusBar, View, Text } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { BackHandler, Platform } from "react-native";
import * as Location from "expo-location";
import { LocationObject } from "expo-location";

export default function HomeScreen() {
  const webViewRef = useRef<any>(null);
  const onAndroidBackPress = () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
      return true; // prevent default behavior (exit app)
    }
    return false;
  };

  const [location, setLocation] = useState<LocationObject>();
  const [errorMsg, setErrorMsg] = useState<string>();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getLastKnownPositionAsync({});
      if (location) {
        setLocation(location);
      } else {
        setErrorMsg('定位错误')
      }
    })();

    if (Platform.OS === "android") {
      BackHandler.addEventListener("hardwareBackPress", onAndroidBackPress);
      return () => {
        BackHandler.removeEventListener(
          "hardwareBackPress",
          onAndroidBackPress
        );
      };
    }
  }, []);

  const INJECTEDJAVASCRIPT = `
  const meta = document.createElement('meta'); 
  meta.setAttribute('content', 'initial-scale=1, maximum-scale=1, user-scalable=0'); 
  meta.setAttribute('name', 'viewport'); 
  document.getElementsByTagName('head')[0].appendChild(meta); 
`;

  if (errorMsg) {
    return (
      <View style={style.container}>
        <Text>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar />
      <WebView
        ref={webViewRef}
        style={style.container}
        javaScriptEnabled={true}
        injectedJavaScript={INJECTEDJAVASCRIPT}
        source={{ uri: `https://school-map-web.vercel.app?x=${location?.coords.longitude}&y=${location?.coords.latitude}` }}
      />
      <Text style={{backgroundColor: '#ffffff'}}>{`x=${location?.coords.longitude}&y=${location?.coords.latitude}`}</Text>
    </>
  );
}

const style = {
  container: {
    marginTop: StatusBar.currentHeight,
  },
};
