import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { styles } from '../App';

export default function WorldTab() {
    const [txt, setTxt] = useState('');
    const [txtFocused, setTxtFocused] = useState(false);
    const [btnFetchPressed, setBtnFetchPressed] = useState(false);
    const [displayData, setDisplayData] = useState(null);
    const [copyBtnText, setCopyBtnText] = useState("Copy");
    const [copyBtnPressed, setCopyBtnPressed] = useState(false);

    return (
        <View style ={styles.container}>
            <View>
                <Text style = {styles.h1}>click clock</Text>
            </View>

            <View style = {styles.inputGroup}>
                <TextInput
                    style = {[styles.textInput, txtFocused && styles.textInputFocused]}
                    placeholder = "Enter a city name..."
                    onFocus = {(() => setTxtFocused(true))}
                    onBlur = {(() => setTxtFocused(false))}
                    value = {txt}
                    onChangeText = {setTxt}
                />

                <TouchableOpacity
                style = {[styles.button, btnFetchPressed && styles.buttonPresed]}
                onPressIn = {(() => setBtnFetchPressed(true))}
                onPressOut = {(() => setBtnFetchPressed(false))}
                onPress = {fetchTime}>
                    <Text style = {styles.buttonText}>Fetch Time</Text>                
                </TouchableOpacity>
            </View>

            <View style = {styles.result}>
                {displayData ? (
                    <>
                        <Text style = {styles.resultText}>Time: {displayData.time}</Text>
                        <Text style = {styles.resultText}>Region: {displayData.regionData}</Text>
                        <Text style = {styles.resultText}>Timezone: {displayData.finalTimezone}</Text>
                        <Text style = {styles.resultText}>Data: {displayData.date}</Text>

                        <TouchableOpacity
                        style = {[styles.copyButton, copyBtnPressed && styles.buttonPressed]}
                        onPressIn = {(() => setCopyBtnPressed(true))}
                        onPressOut = {(() => setCopyBtnPressed(false))}
                        onPress = {copyData}>
                        <Text style = {styles.buttonText}>{copyBtnText}</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <Text style = {styles.resultText}>Result Here</Text>
                )}
            </View>    
        </View>
    );

    function updateDisplay(data) {
        if (!data) {
            setDisplayData(null);
            return;
        }

        let parts = data.timezone.split("/"); // ["Asia", "Dubai"]
        let regionData = parts[0];            // "Asia"
        let cityData = parts[1];              // "Dubai"

        // Build the UTC string
        let timezone = "UTC" + data.utc_offset; // "UTC+04:00"

        const newDisplayData = {
            ...data,
            regionData: regionData,
            cityData: cityData,
            finalTimezone: timezone,
        }
    }

    async function copyData() {

    }

    async function fetchTime() {
        const city = txt.trim();

        if (!city) {
            Alert.alert("Please enter a city name.");
            setDisplayData(null);
            return;
        }

        try {
            const response = await fetch(`https://clickclock-service.onrender.com/time?city=${encodeURIComponent(city)}`);

            if (!response.ok) {
                Alert.alert("City not found or network error!");
            }

            const data = await response.json();
            updateDisplay(data);
        } catch (err) {
            Alert.alert("Error: " + err.message);
            setDisplayData(null);
        }
    }
}