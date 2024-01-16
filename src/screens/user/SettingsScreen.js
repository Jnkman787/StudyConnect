import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { width } from '../../utils/Scaling';
import Colors from '../../utils/Colors';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { Foundation } from '@expo/vector-icons';

// settings options:
// Account
// Privacy
// Security
// Group preferences
// Language
// Report a problem
// Terms and Policies
// About

const getSettingsIcon = (option) => {
    let icon;

    if (option === 'Account') {
        icon = <MaterialCommunityIcons name='account' size={width > 550 ? 40 : 35} color='#999999'/>
    } else if (option === 'Privacy') {
        icon = <FontAwesome name='lock' size={width > 550 ? 38 : 33} color='#999999'/>
    } else if (option === 'Security') {
        icon = <MaterialCommunityIcons name='shield' size={width > 550 ? 35 : 30} color='#999999'/>
    } else if (option === 'Group preferences') {
        icon = <MaterialIcons name='group' size={width > 550 ? 38 : 33} color='#999999'/>
    } else if (option === 'Language') {
        icon = <MaterialIcons name='language' size={width > 550 ? 38 : 33} color='#999999'/>
    } else if (option === 'Report a problem') {
        icon = <Ionicons name='flag' size={width > 550 ? 35 : 30} color='#999999'/>
    } else if (option === 'Terms and Policies') {
        icon = <Ionicons name='document-text' size={width > 550 ? 35 : 30} color='#999999'/>
    } else if (option === 'About') {
        icon = <Foundation name='info' size={width > 550 ? 40 : 35} color='#999999'/>
    }

    return icon;
};

const SettingsScreen = ({ navigation }) => {
    const SettingsOption = (option) => {
        return (
            <View style={styles.optionContainer}>
                <View style={{ width: width > 550 ? 40 : 35, height: width > 550 ? 40 : 35, alignItems: 'center', justifyContent: 'center' }}>
                    {getSettingsIcon(option)}
                </View>
                <Text style={{ flex: 1, marginLeft: width > 550 ? 15 : 10, fontFamily: 'roboto-medium', fontSize: width > 550 ? 20 : 18 }}>{option}</Text>
                <AntDesign name='right' size={width > 550 ? 25 : 22} color='#999999'/>
            </View>
        );
    };

    return (
        <View style={styles.screen}>
            {SettingsOption('Account')}
            {SettingsOption('Privacy')}
            {SettingsOption('Security')}
            {SettingsOption('Group preferences')}
            {SettingsOption('Language')}
            {SettingsOption('Report a problem')}
            {SettingsOption('Terms and Policies')}
            {SettingsOption('About')}
        </View>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.theme,
        paddingTop: 10
    },
    optionContainer: {
        alignSelf: 'center',
        width: '90%',
        height: width > 550 ? 75 : 60,
        //backgroundColor: 'red',
        flexDirection: 'row',
        alignItems: 'center'
    }
});

export default SettingsScreen;