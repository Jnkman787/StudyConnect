import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { width } from '../../utils/Scaling';
import Colors from '../../utils/Colors';

const NotificationsScreen = ({ navigation }) => {
    return (
        <View style={styles.screen}></View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.theme
    }
});

export default NotificationsScreen;