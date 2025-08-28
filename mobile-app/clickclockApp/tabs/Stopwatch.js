import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../App';

export default function StopwatchTab() {
    const [btnStopwatchPressed, setBtnStopwatchPressed] = useState(false);
    const [btnStopwatchTxt, setBtnStopwatchTxt] = useState("Start");
    const [btnResetPressed, setBtnResetPressed] = useState(false);
    const [stopwatchTxt, setStopwatchTxt] = useState("0:00.00");

    const [running, setRunning] = useState(false);
    const [time, setTime] = useState(0); // time in milliseconds
    const intervalRef = useRef(null);

    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const centiseconds = Math.floor((ms % 1000) / 10);

        if (hours > 0) {
            // if more than 1 hour then show hours
            return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
        } else {
            // val is less than 1 hour so show MM:SS:CS
            return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
        }
    }

    return (
        <View style ={styles.container}>
            <View>
                <Text style = {styles.h1}>click clock</Text>
            </View>

            <View style = {styles.inputGroup}>
                <TouchableOpacity
                style = {[styles.button, btnStopwatchPressed && styles.buttonPressed]}
                onPressIn = {(() => setBtnStopwatchPressed(true))}
                onPressOut = {(() => setBtnStopwatchPressed(false))}
                onPress = {stopwatch}>
                <Text style = {styles.buttonText}>{btnStopwatchTxt}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style = {[styles.button, { backgroundColor: "red" }, btnResetPressed && styles.buttonPressed, time === 0 && { backgroundColor: "#aaa" }]}
                    onPressIn = {(() => setBtnResetPressed(true))}
                    onPressOut = {(() => setBtnResetPressed(false))}
                    onPress = {reset}
                    disabled = {time === 0}>
                    <Text style = {styles.buttonText}>Reset</Text>
                </TouchableOpacity>
            </View>

            <View style = {styles.result}>
                <Text style = {styles.resultText}>{stopwatchTxt}</Text>
            </View>
        </View>
    );

    function stopwatch() {
        if (running) {
            // pause
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setRunning(false);
            setBtnStopwatchTxt("Resume");
        } else {
            // start or resume
            const startTime = Date.now() - time; // continue from saved time
            intervalRef.current = setInterval(() => {
                const newTime = Date.now() - startTime;
                setTime(newTime);
                setStopwatchTxt(formatTime(newTime));
            }, 10);
            setRunning(true);
            setBtnStopwatchTxt("Pause");
        }
    }

    function reset() {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setTime(0);
        setStopwatchTxt("0:00:00");
        setBtnStopwatchTxt("Start");
        setRunning(false);
    }
}